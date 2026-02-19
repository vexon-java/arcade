import os
import django
from django.test import TransactionTestCase
from django.contrib.auth.models import User
from app.models import Account, Transaction
from rest_framework.test import APIClient
from decimal import Decimal
import threading
from django.db import connection

class FintechAPITestCase(TransactionTestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='test@example.com', email='test@example.com', password='password')
        self.client.force_authenticate(user=self.user)
        
        self.acc_usd = Account.objects.create(user=self.user, currency='USD', balance=1000)
        self.acc_eur = Account.objects.create(user=self.user, currency='EUR', balance=500)

    def test_transfer_insufficient_funds(self):
        url = '/api/transactions'
        data = {
            "from_account_id": self.acc_usd.id,
            "to_account_id": self.acc_eur.id,
            "amount": 2000
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Insufficient funds", response.data['error'])
        
        self.acc_usd.refresh_from_db()
        self.assertEqual(self.acc_usd.balance, 1000)

    def test_analytics_range(self):
        # Create transactions on different dates
        t1 = Transaction.objects.create(account=self.acc_usd, type='deposit', amount=500, status='success')
        t1.created_at = '2026-01-01T12:00:00Z'
        t1.save()
        
        t2 = Transaction.objects.create(account=self.acc_usd, type='withdraw', amount=200, status='success')
        t2.created_at = '2026-01-02T12:00:00Z'
        t2.save()
        
        url = f'/api/users/{self.user.id}/analytics?from=2026-01-01&to=2026-01-10'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_income'], 500)
        self.assertEqual(response.data['total_spent'], 200)
        self.assertEqual(response.data['net_cashflow'], 300)
        self.assertEqual(response.data['by_day']['2026-01-01'], 500)
        self.assertEqual(response.data['by_day']['2026-01-02'], -200)

    def test_withdraw_race_condition(self):
        # We'll try to withdraw 600 twice from 1000 balance.
        # Only one should succeed.
        
        url = '/api/transactions'
        data = {
            "account": self.acc_usd.id,
            "type": "withdraw",
            "amount": 600
        }
        
        results = []
        def make_request():
            try:
                client = APIClient()
                client.force_authenticate(user=self.user)
                res = client.post(url, data, format='json')
                results.append(res.status_code)
            except Exception as e:
                results.append(str(e))
            finally:
                connection.close()

        t1 = threading.Thread(target=make_request)
        t2 = threading.Thread(target=make_request)
        
        t1.start()
        t2.start()
        t1.join()
        t2.join()
        
        self.acc_usd.refresh_from_db()
        # In SQLite, one might return 201 and the other might return 400 (balance) 
        # OR one might throw a "database is locked" error.
        # Ideally, balance should be 400.
        self.assertEqual(self.acc_usd.balance, 400)

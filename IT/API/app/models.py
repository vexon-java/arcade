from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Account(models.Model):
    CURRENCY_CHOICES = [
        ('USD', 'USD'),
        ('EUR', 'EUR'),
        ('UZS', 'UZS'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES)
    balance = models.DecimalField(max_digits=18, decimal_places=2, default=0)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.currency} ({self.balance})"

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('deposit', 'Deposit'),
        ('withdraw', 'Withdraw'),
        ('transfer', 'Transfer'),
        ('transfer_in', 'Transfer In'),
        ('transfer_out', 'Transfer Out'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=18, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    # For transfers, we might want to link the other account, but let's keep it simple as per requirements
    # "transfer" will be handled by creating two transactions or a single record with more info
    # To follow the task exactly: "transfer" type.
    
    class Meta:
        indexes = [
            models.Index(fields=['account']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.type} - {self.amount} ({self.status})"

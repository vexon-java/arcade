from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.db.models import Sum, Max, Avg, Case, When, F, Value, DecimalField
from django.db.models.functions import TruncDate
from django.contrib.auth.models import User
from .models import Account, Transaction
from .serializers import UserSerializer, AccountSerializer, TransactionSerializer, TransferSerializer
from decimal import Decimal
from django.utils.dateparse import parse_date

EXCHANGE_RATES = {
    'USD': Decimal('1.0'),
    'EUR': Decimal('1.1'),
    'UZS': Decimal('0.00008'),
}

class APIRootView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({
            "message": "Welcome to Fintech Service API",
            "endpoints": {
                "auth_token": "/api/token/",
                "auth_refresh": "/api/token/refresh/",
                "create_user": "/api/users",
                "create_account": "/api/accounts",
                "create_transaction": "/api/transactions",
                "user_balance": "/api/users/{id}/balance",
                "user_analytics": "/api/users/{id}/analytics"
            }
        })

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class AccountCreateView(generics.CreateAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionCreateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'from_account_id' in request.data and 'to_account_id' in request.data:
            return self.handle_transfer(request)
        
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                account = Account.objects.select_for_update().get(id=serializer.validated_data['account'].id)
                t_type = serializer.validated_data['type']
                amount = serializer.validated_data['amount']

                if t_type == 'deposit':
                    account.balance += amount
                elif t_type == 'withdraw':
                    if account.balance < amount:
                        return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)
                    account.balance -= amount
                
                account.save()
                serializer.save(status='success')
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def handle_transfer(self, request):
        serializer = TransferSerializer(data=request.data)
        if serializer.is_valid():
            from_account_id = serializer.validated_data['from_account_id']
            to_account_id = serializer.validated_data['to_account_id']
            amount = serializer.validated_data['amount']

            with transaction.atomic():
                # Lock both accounts to prevent deadlocks and race conditions
                # We always lock in the same order (ascending ID) to avoid deadlocks
                ids = sorted([from_account_id, to_account_id])
                accounts = Account.objects.select_for_update().filter(id__in=ids)
                
                if accounts.count() < 2:
                    return Response({"error": "One or both accounts not found"}, status=status.HTTP_404_NOT_FOUND)
                
                from_account = next(acc for acc in accounts if acc.id == from_account_id)
                to_account = next(acc for acc in accounts if acc.id == to_account_id)

                if from_account.balance < amount:
                    return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)

                # Assuming transfers within the same currency for simplicity in this task
                # or we convert if needed. The requirement doesn't specify cross-currency transfers,
                # but let's assume same currency for now or simple balance deduction.
                # Actually, real service would convert. Let's just deduct/add as requested.
                
                from_account.balance -= amount
                to_account.balance += amount
                
                from_account.save()
                to_account.save()

                Transaction.objects.create(account=from_account, type='transfer_out', amount=amount, status='success')
                Transaction.objects.create(account=to_account, type='transfer_in', amount=amount, status='success')

                return Response({"message": "Transfer successful"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserBalanceView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if str(request.user.id) != str(pk):
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
        accounts = Account.objects.filter(user_id=pk)
        total_usd = Decimal('0.0')
        for acc in accounts:
            rate = EXCHANGE_RATES.get(acc.currency, Decimal('1.0'))
            total_usd += acc.balance * rate
        
        return Response({"total_balance_usd": total_usd})

class AnalyticsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')
        
        if not from_date or not to_date:
            return Response({"error": "from and to dates are required"}, status=status.HTTP_400_BAD_REQUEST)

        accounts = Account.objects.filter(user_id=pk)
        account_ids = list(accounts.values_list('id', flat=True))

        if not account_ids:
            return Response({"message": "No accounts found"}, status=status.HTTP_404_NOT_FOUND)

        transactions = Transaction.objects.filter(
            account_id__in=account_ids,
            created_at__date__range=[from_date, to_date],
            status='success'
        )

        income = transactions.filter(type__in=['deposit', 'transfer_in']).aggregate(total=Sum('amount'))['total'] or 0
        spent = transactions.filter(type__in=['withdraw', 'transfer_out']).aggregate(total=Sum('amount'))['total'] or 0
        
        largest = transactions.aggregate(val=Max('amount'))['val'] or 0
        average = transactions.aggregate(val=Avg('amount'))['val'] or 0

        # By day net cashflow
        by_day_raw = transactions.annotate(date=TruncDate('created_at')).values('date').annotate(
            net_flow=Sum(
                Case(
                    When(type__in=['deposit', 'transfer_in'], then=F('amount')),
                    When(type__in=['withdraw', 'transfer_out'], then=-F('amount')),
                    default=Value(0),
                    output_field=DecimalField()
                )
            )
        ).order_by('date')

        by_day = {str(item['date']): float(item['net_flow']) for item in by_day_raw}

        data = {
            "total_income": float(income),
            "total_spent": float(spent),
            "net_cashflow": float(income - spent),
            "largest_transaction": float(largest),
            "average_transaction": round(float(average), 2),
            "by_day": by_day
        }

        return Response(data)

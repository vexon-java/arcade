from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Account, Transaction
from django.db import transaction

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'date_joined']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'], # Using email as username for simplicity
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'user', 'currency', 'balance']
        read_only_fields = ['balance']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'account', 'type', 'amount', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

    def validate(self, data):
        account = data['account']
        amount = data['amount']
        t_type = data['type']

        if t_type == 'withdraw' and account.balance < amount:
            raise serializers.ValidationError("Insufficient funds for withdrawal.")
        
        return data

class TransferSerializer(serializers.Serializer):
    from_account_id = serializers.IntegerField()
    to_account_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=18, decimal_places=2)

    def validate(self, data):
        if data['from_account_id'] == data['to_account_id']:
            raise serializers.ValidationError("Cannot transfer to the same account.")
        if data['amount'] <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return data

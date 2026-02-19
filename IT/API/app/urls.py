from django.urls import path
from .views import (
    APIRootView, UserCreateView, AccountCreateView, TransactionCreateView, 
    UserBalanceView, AnalyticsView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('users', UserCreateView.as_view(), name='user-create'),
    path('accounts', AccountCreateView.as_view(), name='account-create'),
    path('transactions', TransactionCreateView.as_view(), name='transaction-create'),
    path('users/<int:pk>/balance', UserBalanceView.as_view(), name='user-balance'),
    path('users/<int:pk>/analytics', AnalyticsView.as_view(), name='user-analytics'),
    
    # Auth
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

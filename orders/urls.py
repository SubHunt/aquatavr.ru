from django.urls import path
from .views import (
    OrderListView, OrderDetailView, RepeatOrderView,
    CartView, CartAddItemView, CartItemUpdateDeleteView
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/repeat/', RepeatOrderView.as_view(), name='order-repeat'),
    
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', CartAddItemView.as_view(), name='cart-add'),
    path('cart/items/<int:pk>/', CartItemUpdateDeleteView.as_view(), name='cart-item-detail'),
]

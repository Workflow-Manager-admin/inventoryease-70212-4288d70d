from django.urls import path
from .views import health, inventory_list_create, inventory_delete

urlpatterns = [
    path('health/', health, name='Health'),
    path('inventory/', inventory_list_create, name='inventory-list-create'),     # GET, POST
    path('inventory/<int:pk>/', inventory_delete, name='inventory-delete'),      # DELETE
]

from rest_framework import serializers
from .models import InventoryItem


# PUBLIC_INTERFACE
class InventoryItemSerializer(serializers.ModelSerializer):
    """
    Serializer for InventoryItem model.
    """
    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'quantity']

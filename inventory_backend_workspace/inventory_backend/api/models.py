from django.db import models


# PUBLIC_INTERFACE
class InventoryItem(models.Model):
    """
    Represents an inventory item with a name and quantity.
    """
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.quantity})"

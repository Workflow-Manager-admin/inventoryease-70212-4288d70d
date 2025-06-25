from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import InventoryItem
from .serializers import InventoryItemSerializer


@api_view(['GET'])
def health(request):
    """
    Health check endpoint.
    """
    return Response({"message": "Server is up!"})


# PUBLIC_INTERFACE
@api_view(['GET', 'POST'])
def inventory_list_create(request):
    """
    inventory_list_create(request):
        GET: Return a list of all inventory items as JSON.
        POST: Add a new inventory item (requires 'name' and 'quantity').
    """
    if request.method == 'GET':
        items = InventoryItem.objects.all()
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = InventoryItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUBLIC_INTERFACE
@api_view(['DELETE'])
def inventory_delete(request, pk):
    """
    inventory_delete(request, pk):
        DELETE: Remove the inventory item with the specified id (pk).
    """
    try:
        item = InventoryItem.objects.get(pk=pk)
    except InventoryItem.DoesNotExist:
        return Response({'error': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)
    item.delete()
    return Response({'success': 'Item deleted.'}, status=status.HTTP_204_NO_CONTENT)

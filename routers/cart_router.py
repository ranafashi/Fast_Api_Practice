from fastapi import APIRouter, Depends, status
from models import AddToCart, UpdateQuantity
from core.security import get_current_user
from . import cart_functions

router = APIRouter()


@router.get("/cart", status_code=status.HTTP_200_OK)
def get_cart(current_user: dict = Depends(get_current_user)):
    return cart_functions.view_cart(current_user["_id"])


@router.post("/cart/items", status_code=status.HTTP_201_CREATED)
def add_item(req: AddToCart, current_user: dict = Depends(get_current_user)):
    return cart_functions.add_to_cart(current_user["_id"], req)


@router.put("/cart/items/{product_id}", status_code=status.HTTP_200_OK)
def change_qty(
    product_id: int,
    req: UpdateQuantity,
    current_user: dict = Depends(get_current_user),
):
    return cart_functions.update_quantity(current_user["_id"], product_id, req.quantity)


@router.delete("/cart/items/{product_id}", status_code=status.HTTP_200_OK)
def remove(product_id: int, current_user: dict = Depends(get_current_user)):
    return cart_functions.remove_item(current_user["_id"], product_id)


@router.delete("/cart", status_code=status.HTTP_200_OK)
def empty(current_user: dict = Depends(get_current_user)):
    return cart_functions.clear_cart(current_user["_id"])

from fastapi import APIRouter, Depends, BackgroundTasks, status
from core.security import get_current_user
from core.email_utils import send_order_email
from . import order_functions

router = APIRouter()


@router.post("/orders/checkout", status_code=status.HTTP_201_CREATED)
def checkout(
    background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)
):
    order = order_functions.checkout(current_user["_id"], current_user["email"])

    # Notify store by email after the customer confirms the order
    background_tasks.add_task(send_order_email, order, current_user["email"])

    return order


@router.get("/orders", status_code=status.HTTP_200_OK)
def my_orders(current_user: dict = Depends(get_current_user)):
    return order_functions.list_my_orders(current_user["_id"])


@router.get("/orders/{order_id}", status_code=status.HTTP_200_OK)
def one_order(order_id: str, current_user: dict = Depends(get_current_user)):
    return order_functions.get_order(current_user["_id"], order_id)

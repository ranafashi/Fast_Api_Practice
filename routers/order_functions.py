import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from db_config import order_collection, carts, collection
from . import cart_functions
from log.logs import logger

def _public_order(doc: dict) -> dict:
    order = dict(doc)
    order.pop("_id", None)
    return order


def checkout(user_id: str, customer_email: str):
    cart = carts.find_one({"user_id": user_id})
    if cart is None or not cart.get("items"):
        logger.warning(f"Checkout failed - empty cart: user={user_id}")
        raise HTTPException(status_code=400, detail="Cart is empty")

    items = cart["items"]

    for item in items:
        product = collection.find_one({"id": item["product_id"]})
        if product is None:
            logger.error(
                f"Checkout failed - product missing: id={item['product_id']}, user={user_id}"
            )
            raise HTTPException(
                status_code=404, detail=f"Product {item['product_id']} no longer exists"
            )
        if product["quantity"] < item["quantity"]:
            logger.warning(
                f"Checkout failed - low stock: product={item['product_id']}, user={user_id}"
            )
            raise HTTPException(
                status_code=400, detail=f"Not enough stock for {item['name']}"
            )

    for item in items:
        result = collection.update_one(
            {"id": item["product_id"], "quantity": {"$gte": item["quantity"]}},
            {"$inc": {"quantity": -item["quantity"]}},
        )
        if result.modified_count == 0:
            logger.warning(
                f"Checkout stock conflict: product={item['product_id']}, user={user_id}"
            )
            raise HTTPException(
                status_code=400,
                detail=f"Stock changed for {item['name']}, please retry",
            )

    # Build and save the order (price snapshot)
    total = sum(i["price"] * i["quantity"] for i in items)
    order = {
        "order_id": str(uuid.uuid4()),
        "user_id": user_id,
        "customer_email": customer_email,
        "items": items,
        "total": total,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    order_collection.insert_one(order.copy())

    cart_functions.clear_cart(user_id)

    logger.info(
        f"Order placed: order_id={order['order_id']}, user={user_id}, total={total}"
    )

    return _public_order(order)


def list_my_orders(user_id: str):
    orders = list(
        order_collection.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1)
    )
    return orders


def get_order(user_id: str, order_id: str):
    order = order_collection.find_one(
        {"order_id": order_id, "user_id": user_id}, {"_id": 0}
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

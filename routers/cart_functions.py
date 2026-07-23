from db_config import carts,collection
from models import AddToCart
from fastapi import HTTPException


def get_or_create_cart(user_id:str):
    cart = carts.find_one({"user_id":user_id},{"_id":0})
    if  not cart :
        cart = {"user_id":user_id,"items":[]}
        carts.insert_one(cart)
    return cart


def compute_total(items):
    return sum(item["price"] * item["quantity"] for item in items)


def view_cart(user_id: str):
    cart = get_or_create_cart(user_id)
    return {"items": cart["items"], "total": compute_total(cart["items"])}


def add_to_cart(user_id: str, req: AddToCart):
    product = collection.find_one({"id": req.product_id}, {"_id": 0})
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["quantity"] < req.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    get_or_create_cart(user_id)
    cart = carts.find_one({"user_id": user_id})

    # already in cart? increase quantity
    for item in cart["items"]:
        if item["product_id"] == req.product_id:
            new_qty = item["quantity"] + req.quantity
            if product["quantity"] < new_qty:
                raise HTTPException(status_code=400, detail="Not enough stock")
            carts.update_one(
                {"user_id": user_id, "items.product_id": req.product_id},
                {"$set": {"items.$.quantity": new_qty}},
            )
            return view_cart(user_id)

    # not in cart yet -> add new line item
    new_item = {
        "product_id": product["id"],
        "name": product["name"],
        "quantity": req.quantity,
        "price": product["price"],
    }
    carts.update_one({"user_id": user_id}, {"$push": {"items": new_item}})
    return view_cart(user_id)


def update_quantity(user_id: str, product_id: int, quantity: int):
    if quantity == 0:
        return remove_item(user_id, product_id)

    result = carts.update_one(
        {"user_id": user_id, "items.product_id": product_id},
        {"$set": {"items.$.quantity": quantity}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not in cart")
    return view_cart(user_id)


def remove_item(user_id: str, product_id: int):
    carts.update_one(
        {"user_id": user_id}, {"$pull": {"items": {"product_id": product_id}}}
    )
    return view_cart(user_id)


def clear_cart(user_id: str):
    carts.update_one({"user_id": user_id}, {"$set": {"items": []}})
    return {"message": "Cart cleared"}

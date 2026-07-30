from db_config import collection
from fastapi import HTTPException, status
from models import Product
from pymongo import ReturnDocument
from log.logs import logger
from .image_utils import build_product_image_url, ensure_product_image


# api get all products

def all_products():
    products = list(collection.find({}, {"_id": 0}).sort({"id": 1}))
    if not products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    enriched = []
    for product in products:
        updated = ensure_product_image(product, refresh_auto=True)
        # Persist newly resolved name-based images so later loads stay fast/stable
        if updated.get("image_url") and updated.get("image_url") != product.get("image_url"):
            collection.update_one(
                {"id": product["id"]},
                {"$set": {"image_url": updated["image_url"]}},
            )
        enriched.append(updated)
    return enriched


def _prepare_product_doc(product: Product) -> dict:
    data = product.model_dump()
    if not data.get("image_url"):
        data["image_url"] = build_product_image_url(
            product_id=product.id,
            name=product.name,
            category=product.category,
        )
    return data


# api add only 1 Product
# applying logs


def add_product(product: Product):

    if collection.find_one({"id": product.id}):
        logger.warning(f"Add Product Failed :{product.id} already exists ")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Product alreay exists"
        )

    data = _prepare_product_doc(product)
    collection.insert_one(data)
    logger.info(f"Product added: id={product.id}, name='{product.name}'")
    return {"message": "Product Added Successfully", "product": ensure_product_image(data)}


# add add multiple products
def add_prod_list(product: list[Product]):
    ids = [p.id for p in product]
    if len(ids) != len(set(ids)):
        logger.warning(f"Duplicate IDs")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate ids"
        )

    existing_prod = list(collection.find({"id": {"$in": ids}}))
    if existing_prod:
        logger.warning(f"Product Already Exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Product already exists"
        )

    docs = [_prepare_product_doc(p) for p in product]
    collection.insert_many(docs)
    return {
        "message": "Products added Succesfully",
        "product Details": [ensure_product_image(d) for d in docs],
    }


# get  multiple products using id
def get_prods_by_id(id: list[int]):
    products = list(collection.find({"id": {"$in": id}}, {"_id": 0}))
    if products:
        return [ensure_product_image(p) for p in products]
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND
    )


# update product
def update_prod(id: int, product: Product, name: str = None):
    filter = {"id": id}
    if name is not None:
        filter["name"] = name
    data = _prepare_product_doc(product)
    result = collection.find_one_and_update(
        filter,
        {"$set": data},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    logger.info(f"Product Updated : id = {id} , name = {name}")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return ensure_product_image(result)


# delete product list
def del_prod_list(id: list[int], name: str = None):
    filter = {"id": {"$in": id}}
    if name is not None:
        filter["name"] = name

    result = collection.delete_many(filter)
    return {"message": "Products deleted Successfully", "detail": result.deleted_count}


# Aggregation functions  testing


# match filtering
# making it dynamic
def prod_categories(category: str):
    cat = list(
        collection.aggregate(
            [
                {"$match": {"category": category}},
                {
                    "$project": {
                        "_id": 0,
                        "name": 1,
                        "id": 1,
                        "category": 1,
                        "image_url": 1,
                    }
                },
                {"$sort": {"id": 1}},
            ]
        )
    )
    return [ensure_product_image(p) for p in cat]


def resolve_product_image(
    product_id: int | None = None,
    name: str | None = None,
    category: str | None = None,
):
    """
    Resolve a real product image URL.
    Prefer stored product.image_url when id is provided; otherwise build from name/category.
    """
    if product_id is not None:
        product = collection.find_one({"id": product_id}, {"_id": 0})
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        enriched = ensure_product_image(product)
        return {
            "product_id": product_id,
            "name": enriched.get("name"),
            "category": enriched.get("category"),
            "image_url": enriched["image_url"],
            "source": "stored" if product.get("image_url") else "resolved",
        }

    if not name and not category:
        raise HTTPException(
            status_code=400,
            detail="Provide product id, or name/category to resolve an image",
        )

    image_url = build_product_image_url(
        product_id=abs(hash(f"{name}|{category}")) % 10_000,
        name=name or "",
        category=category or "",
    )
    return {
        "product_id": None,
        "name": name,
        "category": category,
        "image_url": image_url,
        "source": "resolved",
    }

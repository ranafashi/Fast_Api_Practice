from db_config import collection
from fastapi import HTTPException, status, Query
from models import Product
from pymongo import ReturnDocument
from log.logs import logger


# api get all products
# apply sorting indexing
def all_products():
    products = list(collection.find({}, {"_id": 0}).sort({"id": 1}))
    if products:
        return products
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND
    )


# api add only 1 Product
# applying logs


def add_product(product: Product):

    if collection.find_one({"id": product.id}):
        logger.warning(f"Add Product Failed :{product.id} already exists ")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Product alreay exists"
        )

    collection.insert_one(product.model_dump())
    logger.info(f"Product added: id={product.id}, name='{product.name}'")
    return {"message": "Product Added Successfully", "product": product}


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

    collection.insert_many([p.model_dump() for p in product])
    return {"message": "Products added Succesfully", "product Details": product}


# get  multiple products using id
def get_prods_by_id(id: list[int]):
    products = list(collection.find({"id": {"$in": id}}, {"_id": 0}))
    if products:
        return products
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND
    )


# update product
def update_prod(id: int, product: Product, name: str = None):
    filter = {"id": id}
    if name is not None:
        filter["name"] = name
    result = collection.find_one_and_update(
        filter,
        {"$set": product.model_dump()},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    logger.info(f"Product Updated : id = {id} , name = {name}")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result


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
                {"$project": {"_id": 0, "name": 1, "id": 1, "category": 1}},
                {"$sort": {"id": 1}},
            ]
        )
    )
    return cat

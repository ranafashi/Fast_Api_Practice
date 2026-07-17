from db_config import collection
from fastapi import HTTPException, status, Query
from models import Product
from pymongo import ReturnDocument


# api get all products
# apply sorting indexing
def all_products():
    products = list(collection.find({}, {"_id": 0}).sort({"id": 1}))
    if products:
        return products
    raise HTTPException(
        status_code=status.HTTP_204_NO_CONTENT, detail="No product exists"
    )


# api add only 1 Product
def add_product(product: Product):
    if collection.find_one({"id": product.id}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Product alreay exists"
        )
    collection.insert_one(product.model_dump())
    return {"message": "Product Added Successfully", "product": product}


# add add multiple products
def add_prod_list(product: list[Product]):
    ids = [p.id for p in product]
    if len(ids) != len(set(ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate ids"
        )

    existing_prod = list(collection.find({"id": {"$in": ids}}))
    if existing_prod:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Product already exists"
        )

    collection.insert_many([p.model_dump() for p in product])
    return {"message": "Products added Succesfully", "product Details": product}


# get  multiple products using id
def get_prods_by_id(id: list[int] = Query(...)):
    products = list(collection.find({"id": {"$in": id}}, {"_id": 0}))
    if products:
        return products
    raise HTTPException(
        status_code=status.HTTP_404_NO_CONTENT, detail="No Product found"
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
    return result


# delete product list
def del_prod_list(id: list[int] = Query(...), name: str = None):
    filter = {"id": {"$in": id}}
    if name is not None:
        filter["name"] = name

    result = collection.delete_many(filter)
    return {"message": "Products deleted Successfully", "detail": result.deleted_count}


# Aggregation functions  testing


# match filtering 
#making it dynamic
def prod_categories(category:str):
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

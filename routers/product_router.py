from fastapi import APIRouter, status, HTTPException, Query, Depends
from db_config import collection
from models import Product
from . import product_functions

router = APIRouter()


# GET all Products
@router.get("/products", status_code=status.HTTP_200_OK)
def get_all_product(data=Depends(product_functions.all_products)):
    return data

    # products = list(
    #     collection.find(  # fisrt arg is filter 2nd is Dont return _id of mongo
    #         {}, {"_id": 0}
    #     )
    # )
    # if products:
    #     return products
    # # service layer and pep8
    # raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)


# adds only 1 Product
@router.post("/product", status_code=status.HTTP_201_CREATED)
def add_product(product=Depends(product_functions.add_product)):
    return product
    # Avoid adding same product with same id
    # if collection.find_one({"id": product.id}):
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST, detail="Product alreay exists"
    #     )

    # collection.insert_one(product.model_dump())
    # return {
    #     "message": "Product Added Successfully",
    #     "product": product,
    # }
    # what is result.insertid ?


# add multiple products
@router.post("/add_product_list", status_code=status.HTTP_201_CREATED)
def add_product_List(product=Depends(product_functions.add_prod_list)):
    return product
    # for p in product:
    #     if collection.find_one({"id": p.id}, {"_id": 0}):
    #         raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST, detail="Product alreay exists"
    #         )

    # collection.insert_many([p.model_dump() for p in product])

    # return {"message": "Products added Succesfully", "product Details": product}


# get multiple products by using id
@router.get("/product")  # -> {id} isPath parameter
def get_product_by_id(data=Depends(product_functions.get_prods_by_id)):
    return data
    # -> querry parameter
    # product = list(collection.find({"id": {"$in": id}}, {"_id": 0}))
    # if product:
    #     return product
    # raise HTTPException(status_code=404, detail="Product Not Found")


# UPDATE product
@router.put("/product", status_code=status.HTTP_200_OK)
def update_product(product=Depends(product_functions.update_prod)):
    return product
    # result = collection.find_one_and_update(
    #     {"id": id}, {"$set": product.model_dump()}, {"_id": 0}
    # )
    # if result is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND, detail="No match found"
    #     )
    # return {"message": "Product updated Successfuly", "Prodct details": result}


# match count and result.modified count


# delets List of product
@router.delete("/product", status_code=status.HTTP_200_OK)
def delete_product(data=Depends(product_functions.del_prod_list)):
    return data

    # filter = {"id": {"$in": id}}
    # if name is not None:
    #     filter["name"] = name
    # product = list(collection.find(filter, {"_id": 0}))
    # if product:
    #     collection.delete_many(filter)
    #     return {"message": "Product deleted Successfuly", "Prodct details": product}
    # raise HTTPException(status_code=404, detail="Product Not Found")


# Aggregation functions  testing


@router.get("/prod_categories", status_code=status.HTTP_200_OK)
def get_prod_categories(category:str = Query(...)):
    return product_functions.prod_categories(category)

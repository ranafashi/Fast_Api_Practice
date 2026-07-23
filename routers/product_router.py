from fastapi import APIRouter, status, HTTPException, Query, Depends
from db_config import collection
from models import Product
from . import product_functions
from core.security import require_admin
router = APIRouter()


# GET all Products
@router.get("/products", status_code=status.HTTP_200_OK)
def get_all_product():
    data = product_functions.all_products()
    return data


# adds only 1 Product
@router.post("/product", status_code=status.HTTP_201_CREATED)
def add_product(product: Product, admin=Depends(require_admin)):
    data = product_functions.add_product(product)
    return data


# add multiple products
@router.post(
    "/add_product_list",
    status_code=status.HTTP_201_CREATED
)
def add_product_List(
    product: list[Product],
    admin=Depends(require_admin),
):
    data = product_functions.add_prod_list(product)
    return data


# get multiple products by using id
@router.get("/product") 
def get_product_by_id(id: list[int] = Query(...)):
    data = product_functions.get_prods_by_id(id)
    return data


# UPDATE product
@router.put("/product", status_code=status.HTTP_200_OK)
def update_product(
    id: int, product: Product, name: str = None, admin=Depends(require_admin)
):
    data = product_functions.update_prod(id, product, name)
    return data


# delets List of product
@router.delete("/product", status_code=status.HTTP_200_OK)
def delete_product(
    id: list[int] = Query(...), name: str = None, admin=Depends(require_admin)
):
    data = product_functions.del_prod_list(id, name)
    return data


# Aggregation functions  testing


@router.get("/prod_categories", status_code=status.HTTP_200_OK)
def get_prod_categories(category: str = Query(...)):
    return product_functions.prod_categories(category)

from fastapi import FastAPI, HTTPException, Request, status
from models import Product, User, EmailStr
from DB_Config import collection

app = FastAPI()
products = [
    Product(
        id=1, name="Iphone", description="lattest apple phone", price=1000, quantity=10
    ),
    Product(
        id=2,
        name="Samsung Washing machine",
        description="lattest washing machne",
        price=10000,
        quantity=50,
    ),
]


@app.get("/")
def homePage():
    return "Welcome to Home Page"


@app.get("/products")
def get_all_product():
    return products


@app.post("/product", status_code=status.HTTP_201_CREATED)
def add_product(product: Product):
    products.append(product)
    return {"message": "Product Added Successfully", "product": product}


# get product by id


# @app.get("/product/{id}")
# def get_product_by_id(id: int):
#     for i in range(len(products)):
#         if products[i].id == id:
#             return products[i]
#     return "Product Not Found"


@app.get("/product/{id}")  # -> {id} isPath parameter
def get_product_by_id(id: int = None):  # -> querry parameter
    for prod in products:
        if prod.id == id:
            return prod
    raise HTTPException(status_code=404, detail="Product Not Found")


# @app.get("/product")
# def get_product_by_id(request: Request):  # by default request returns in form of object
#     querry_params = dict(request.query_params)
#     for prod in products:
#         if prod.id == int(querry_params.get("id")):
#             return {"product": prod.id, "Product name": prod.name}
#     raise HTTPException(status_code=404, detail="Product Not Found")


@app.delete("/product")
def delete_product(id: int):
    for i in range(len(products)):
        if products[i].id == id:
            del products[i]
            return "Product deleted Successfuly"
    return "Product Not Found"


# @app.put("/product/{id}")
# def update_product(id: int, product: Product):
#     for i in range(len(products)):
#         if products[i].id == id:
#             products[i] = product
#             return "Product updated Successfully"
#     return "Failed to update product"


@app.put("/product")
def update_product(id: int, product: Product):
    for i in range(len(products)):
        if products[i].id == id:
            products[i] = product
            return "Product updated Successfully"
    return "Failed to update product"


# Nested Pydantic Models
@app.post("/add_user")
def add_User(user: User):
    return {"message": "User addes successfully", "data": user}


# validation
@app.post("/register_User", status_code=status.HTTP_202_ACCEPTED)
def regiter_user(user: User):
    return {"Message": "User Registered", "Data": user}

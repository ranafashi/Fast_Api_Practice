from fastapi import FastAPI, Depends
from routers import product_router, user_routers, cart_router
from db_config import collection, user_collection
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("!!!!!!!!!!!!!!!!Starting Server !!!!!!!!!!!!!!!!!!!!!!!!")
    collection.create_index("id", unique=True)
    user_collection.create_index("email", unique=True)
    yield
    print("!!!!!!!!!!!!!!!!Shuting Down Server !!!!!!!!!!!!!!!!!!!!!!!!")


app = FastAPI(lifespan=lifespan)


app.include_router(product_router.router)
app.include_router(user_routers.router)
app.include_router(cart_router.router)


def homepage_intro():
    return {
        "message": "Welcome to the E-Commerce API",
        "description": "Manage products, users, authentication, and shopping carts.",
        "docs": "/docs",
        "version": "1.0.0",
    }


# Welcom Screen
@app.get("/")
def homePage(data=Depends(homepage_intro)):
    return data



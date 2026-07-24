import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers import product_router, user_routers, cart_router, order_router
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router.router)
app.include_router(user_routers.router)
app.include_router(cart_router.router)
app.include_router(order_router.router)


def homepage_intro():
    return {
        "message": "Welcome to the E-Commerce API",
        "description": "Manage products, users, authentication, shopping carts, and orders.",
        "docs": "/docs",
        "version": "1.0.0",
    }


# Welcom Screen
@app.get("/")
def homePage(data=Depends(homepage_intro)):
    return data

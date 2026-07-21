from fastapi import APIRouter, status, Depends
from models import UserResponse, DeleteUser, LoginSchema
from . import users_functions
from models import User
from pydantic import EmailStr

router = APIRouter()


# Using depends
# Adding User
@router.post(
    "/add_user", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def add_user(user: User):
    data = users_functions.add_user_data(user)
    return data


# Users exists if same email or username taken
# if user_collection.find_one({"email": user.email}):
#     raise HTTPException(status_code=404, detail="Account Already Exist")
# user_collection.insert_one(user.model_dump())


# get all users
@router.get("/get_all_registered_users", status_code=status.HTTP_200_OK)
def registered_users():
    data = users_functions.get_all_users()
    return data
    # all_users = list(user_collection.find({}, {"_id": 0}))
    # if all_users:
    #     return all_users
    # raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)


# delte single User
@router.delete(
    "/delete_user", response_model=DeleteUser, status_code=status.HTTP_200_OK
)
def delete_user(email: EmailStr, name: str = None):
    data = users_functions.delete_user_data(email, name)
    return data


# def delete_user(email: EmailStr, name: str = None):
# del_filter = {"email": email}
# if name is not None:
#     del_filter["name"] = name
# user_data = user_collection.find_one_and_delete(del_filter)
# if user_data is None:
#     raise HTTPException(status_code=404, detail="User not found")
# user_data.pop("_id")
# return {"message": "User Deleted Successfully", "details": user_data}


# AGGREGATION FUNCTION TESTING


# Projects Users name and cities
@router.get("/get_users_cities", status_code=status.HTTP_200_OK)
def get_users_cities():
    return users_functions.user_cities()


# Grouped users based on Cities
@router.get("/get_user_count", status_code=status.HTTP_200_OK)
def get_user_count():
    return users_functions.user_count()


# avg age of User from each city
@router.get("/get_avg_age", status_code=status.HTTP_200_OK)
def get_avg_age():
    return users_functions.avg_age()


# Login functionality
@router.post("/login", status_code=status.HTTP_200_OK)
def login(user: LoginSchema):
    return users_functions.user_login(user)

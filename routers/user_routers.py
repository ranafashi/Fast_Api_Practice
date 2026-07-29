from fastapi import APIRouter, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from models import UserResponse, DeleteUser
from core.security import require_admin
from . import users_functions
from models import User
from pydantic import EmailStr
from core.security import get_current_user

router = APIRouter()


# Using depends
# Adding User
@router.post(
    "/add_user", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def add_user(user: User):
    data = users_functions.add_user_data(user)
    return data

# get all users
@router.get("/get_all_registered_users", status_code=status.HTTP_200_OK)
def registered_users(admin= Depends(require_admin)):
    data = users_functions.get_all_users()
    return data
   
# delete single User
@router.delete(
    "/delete_user", response_model=DeleteUser, status_code=status.HTTP_200_OK
)
def delete_user(email: EmailStr, name: str = None, admin=Depends(require_admin)):
    data = users_functions.delete_user_data(email, name)
    return data

# Projects Users name and cities
@router.get("/get_users_cities", status_code=status.HTTP_200_OK)
def get_users_cities(admin=Depends(require_admin)):
    return users_functions.user_cities()


# Grouped users based on Cities
@router.get("/get_user_count", status_code=status.HTTP_200_OK)
def get_user_count(admin=Depends(require_admin)):
    return users_functions.user_count()


# avg age of User from each city
@router.get("/get_avg_age", status_code=status.HTTP_200_OK)
def get_avg_age(admin=Depends(require_admin)):
    return users_functions.avg_age()


# Login functionality
@router.post("/login", status_code=status.HTTP_200_OK)
def login(user_data: OAuth2PasswordRequestForm = Depends()):
    return users_functions.user_login(user_data.username, user_data.password)


# provide current user
@router.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return current_user

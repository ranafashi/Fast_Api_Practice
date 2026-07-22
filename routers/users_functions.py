# includes dependency functions for users_only
from fastapi import HTTPException, status
from pydantic import EmailStr
from db_config import user_collection
from models import User
from log.logs import logger
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from config import settings
import jwt
from datetime import datetime,timedelta,timezone

ph = PasswordHasher()


# api Add User
def add_user_data(user: User):
    if user_collection.find_one({"email": user.email}):
        logger.warning(f"Add User Failed :{user.email} already exists ")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists"
        )
    data = user.model_dump()
    data["password"] = ph.hash(user.password)
    user_collection.insert_one(data)
    logger.info(f"User Added : {user.email} ")
    return user


# api get all  users
def get_all_users():
    all_users = list(user_collection.find({}, {"_id": 0}).sort({"name": 1}))
    if all_users:
        return all_users
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


# api delete single user
def delete_user_data(email: EmailStr, name: str = None):
    del_filter = {"email": email}
    if name is not None:
        del_filter["name"] = name
    user_data = user_collection.find_one_and_delete(del_filter)

    logger.info(f"User Deleted : {email} ")

    if user_data is None:
        logger.warning(f"User Not found : {email} ")
        raise HTTPException(status_code=404, detail="User not found")
    user_data.pop("_id")

    return {"message": "User Deleted Successfully", "details": user_data}


# AGGREGATION FUNCTIONS TESTING
def user_cities():
    users_data = list(
        user_collection.aggregate(
            [{"$project": {"_id": 0, "name": 1, "age": 1, "city": "$address.city"}}]
        )
    )
    return users_data


# User Count from each city
def user_count():
    user_data = list(
        user_collection.aggregate(
            [{"$group": {"_id": "$address.city", "UsersCount": {"$sum": 1}}}]
        )
    )
    return user_data


# Avg age from each city
def avg_age():
    age = list(
        user_collection.aggregate(
            [{"$group": {"_id": "$address.city", "AvgUserAge": {"$avg": "$age"}}}]
        )
    )
    return age


# Login functionality
def user_login(email: str, password: str):

    user_data = user_collection.find_one({"email": email})
    if not user_data:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    try:
        ph.verify(user_data["password"], password)
    except VerifyMismatchError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password "
        )
    exp_time=datetime.now(timezone.utc) + timedelta(minutes=settings.EXP_TIME)
    token = jwt.encode(
        {"sub": str(user_data["_id"]),"exp":exp_time}, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}

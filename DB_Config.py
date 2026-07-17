from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["Fast_API"]
collection = db["Products"]  # produts
user_collection = db["Users"]

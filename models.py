from pydantic import BaseModel, EmailStr, conint, constr, field_validator, Field


class Product(BaseModel):

    id: int
    name: str
    description: str
    category: str
    price: float
    quantity: int = 0


class Address(BaseModel):
    city: str
    postal_Code: int


class User(BaseModel):
    name: str  
    password: str
    age: int = Field(gt=0)
    email: EmailStr
    address: Address
    role:str ="customer"
   

class UserResponse(BaseModel):
    name: str
    age: int = Field(gt=0)
    email: EmailStr


class DeleteUser(BaseModel):
    message: str
    details: UserResponse


class FileModel(BaseModel):
    filename: str
    text: str


class LoginSchema(BaseModel):
    email: EmailStr
    password:str

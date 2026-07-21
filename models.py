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
    name: str  # constr(pattern=r"^[a-zA-Z0-9]+$")
    password: str
    age: int = Field(gt=0)
    email: EmailStr
    address: Address

    # @field_validator("name")
    # @classmethod
    # def nameMustNotHaveSpace(Class, field):
    #     if " " in field:
    #         raise ValueError("Name Must Not Have Space")
    #     return field


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

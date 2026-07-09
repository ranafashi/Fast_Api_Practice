from pydantic import BaseModel, EmailStr, conint, constr, field_validator


class Product(BaseModel):

    id: int
    name: str
    description: str
    price: int = None
    quantity: int = 0


class Address(BaseModel):
    city: str
    postal_Code: int


class User(BaseModel):
    name: constr(pattern=r"^[a-zA-Z0-9]+$")
    age: conint(gt=0)
    email: EmailStr
    address: Address

    @field_validator("name")
    @classmethod
    def nameMustNotHaveSpace(cls, v):
        if " " in v:
            raise ValueError("Name Must Not Have Space")
        return v

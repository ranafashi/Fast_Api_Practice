from fastapi import FastAPI, Depends, Request, Header, Cookie, Form, UploadFile, File
from fastapi.responses import JSONResponse
from routers import product_router, user_routers
from db_config import collection, user_collection
from models import FileModel
import os
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


def homepage_intro():
    return "Welcome to Home Page"


# Welcom Screen
@app.get("/")
def homePage(data=Depends(homepage_intro)):
    return data


# get single header
@app.get("/header")
def get_header(user_agent_=Header(None)):
    return {"User_Agent_": user_agent_}


# Headers testing
@app.get("/headers/")
def get_header(request: Request):
    return {"All headers": request.headers["cookie"]}


# Cookies testing
@app.get("/cookies/")
def get_header(session_id=Cookie(None)):  # we get session Id value fom cookies
    return {"Session Id": session_id}


# Multiple cookies
@app.get("/mul_cookies/")
def get_header(request: Request):
    return {"Cookies": request.cookies["auth_token"]}


# form data
# used for _user inputs like logins
# search queries
@app.post("/login")
def user_login(
    username: str = Form(...), password: str = Form(...), age: int = Form(...)
):
    return {"User Name": username, "Password": password}


## Upload File
@app.post("/upload_file")
def upload_file(file: UploadFile = File(...)):
    return {"message": "File uploaded successfully", "Filename": file.filename}


##Save file
@app.post("/save_file")
def save_file(file: UploadFile = File(...)):
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(file.file.read())
    return {"message": f"File '{file.filename}' save successfully"}


# Create and save file in a folder
@app.post("/create_and_save_file")
def create_save_file(data: FileModel):
    # create folder
    os.makedirs("files", exist_ok=True)
    # file path
    file_path = f"files/{data.filename}.txt"

    # open file and write data into file
    with open(file_path, "w") as f:
        f.write(data.text)

    return {"message": "File created and Saved"}


# delete file
@app.delete("/delete_file")
def delte_file(filename: str):
    file_path = f"files/{filename}.txt"
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"File '{filename}' deleted successfully"}
    return "No file found"


# upload multiple file
@app.post("/upload_save_mul_files")
def upload_save_mul_files(files: list[UploadFile] = File(...)):
    for file in files:
        with open(f"files/{file.filename}", "wb") as f:
            f.write(file.file.read())
    return {"message": "Files  saved Successfully "}


# Testing Middel Ware
@app.middleware("http")
async def my_middleware(request: Request, call_next):
    print("Middleware : before handling request")

    # Is the user logged in?
    # Is there a valid session or JWT token?
    # Is the token expired?
    
    # if good then continue
    response = await call_next(request)  # Continue to the profile endpoint and Runs it.
    
    print("Middleware : after handling request but before returning response")#do any working on response
        # Add security headers
        # Compress data
        # Log request time
    return response


@app.get("/user")
def get_users():
    print("Inside get user endpoint")
    return {"msg": "ALL users"}

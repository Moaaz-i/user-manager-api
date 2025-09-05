from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import random
import string
from fastapi.responses import FileResponse

app = FastAPI(title="User Manager", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_id(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def load_data():
    if not os.path.exists("fileData.json"):
        with open("fileData.json", "w", encoding="utf-8") as f:
            json.dump({"users": []}, f, ensure_ascii=False, indent=2)
    with open("fileData.json", "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with open("fileData.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.get("/")
async def read_root():
    return {"message": "User Manager API is running!"}


@app.get("/users")
async def get_users():
    return load_data()["users"]


@app.post("/users")
async def create_user(request: Request):
    data = await request.json()
    users_data = load_data()

    email = data.get("email", "").strip().lower()
    name = data.get("name", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        raise HTTPException(
            status_code=422, detail="Email and password are required")

    if any(u["email"].lower() == email for u in users_data["users"]):
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = {
        "id": generate_id(),
        "name": name,
        "email": email,
        "password": password,
        "createdAt": data.get("createdAt", "")
    }

    users_data["users"].append(new_user)
    save_data(users_data)
    return {k: new_user[k] for k in new_user if k != "password"}


@app.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    users = load_data()["users"]
    user = next((u for u in users if u["email"].lower(
    ) == email and u["password"] == password), None)

    if user:
        return {k: user[k] for k in user if k != "password"}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    users_data = load_data()
    new_users = [u for u in users_data["users"] if u["id"] != user_id]
    if len(new_users) == len(users_data["users"]):
        raise HTTPException(status_code=404, detail="User not found")
    users_data["users"] = new_users
    save_data(users_data)
    return {"message": "User deleted successfully"}

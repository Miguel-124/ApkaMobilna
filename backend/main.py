from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth.google import verify_google_token
from backend.auth.jwt import create_access_token
from backend.db import SessionLocal, Base, engine
from backend.models.user import User

def get_or_create_user(user_info):
    db = SessionLocal()
    user = db.query(User).filter(User.google_id == user_info["sub"]).first()
    if not user:
        user = User(
            google_id=user_info["sub"],
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()
    return user

app = FastAPI()

class TokenIn(BaseModel):
    id_token: str

@app.post("/auth/google")
def login_with_google(payload: TokenIn):
    user_info = verify_google_token(payload.id_token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Token nieprawidłowy")

    # Dodajemy użytkownika do bazy
    user = get_or_create_user(user_info)

    # Zwracamy token JWT
    access_token = create_access_token({"sub": user.google_id, "email": user.email})
    return {
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
        },
    }
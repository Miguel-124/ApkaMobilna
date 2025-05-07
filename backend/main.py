from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from auth.google import verify_google_token
from auth.jwt import create_access_token
from models.user import User
from db import get_db

# === 1. Załaduj zmienne środowiskowe z pliku `.env` ===
load_dotenv()

# === 2. Inicjalizacja aplikacji ===
app = FastAPI()

# === 3. Middleware CORS (dla Expo, web i mobilki) ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # W produkcji wpisz konkretne domeny
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 4. Schemat przyjmujący token Google ===
class GoogleLoginRequest(BaseModel):
    token: str

# === 5. Funkcja pomocnicza do tworzenia lub pobrania użytkownika ===
def get_or_create_user(db: Session, email: str, name: str = "", picture: str = "", google_id: str = ""):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            name=name,
            picture=picture,
            google_id=google_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# === 6. Endpoint logowania przez Google ===
@app.post("/auth/google")
def login_with_google(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    payload = verify_google_token(data.token)

    if not payload or "email" not in payload:
        raise HTTPException(status_code=401, detail="Nieprawidłowy token Google")

    user = get_or_create_user(
        db,
        email=payload["email"],
        name=payload.get("name", ""),
        picture=payload.get("picture", ""),
        google_id=payload.get("sub", ""),
    )

    access_token = create_access_token({"sub": user.email})
    return {
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
        },
    }
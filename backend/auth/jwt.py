from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "super_tajne_haslo"  # wrzuć do .env
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_minutes: int = 60 * 24 * 7):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
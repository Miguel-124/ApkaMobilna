from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = "TWOJE_GOOGLE_CLIENT_ID"

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return {
            "sub": idinfo["sub"],  # Google ID
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }
    except Exception as e:
        print("Błąd weryfikacji tokenu Google:", e)
        return None
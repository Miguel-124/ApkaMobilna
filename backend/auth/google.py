import os
from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_IDS = [
    os.getenv("GOOGLE_CLIENT_ID_IOS"),
    os.getenv("GOOGLE_CLIENT_ID_WEB"),
]

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), audience=None)
        if idinfo["aud"] not in GOOGLE_CLIENT_IDS:
            return None
        return idinfo
    except Exception as e:
        print("Błąd weryfikacji tokena:", e)
        return None
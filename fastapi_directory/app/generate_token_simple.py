import os
import sys
from datetime import datetime, timedelta
from jose import jwt

# Set the correct path
sys.path.insert(0, '/app')

# Use the same SECRET_KEY as in security.py
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_token():
    # Generate token for user "Goga" with default expiration
    token = create_access_token(data={"sub": "Goga"}, expires_delta=timedelta(minutes=30))
    print("Generated token:")
    print(token)

if __name__ == "__main__":
    generate_token()

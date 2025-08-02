import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import create_access_token
from datetime import timedelta

def generate_token():
    # Generate token for user "Goga" with default expiration
    token = create_access_token(data={"sub": "Goga"}, expires_delta=timedelta(minutes=30))
    print("Generated token:")
    print(token)

if __name__ == "__main__":
    generate_token()

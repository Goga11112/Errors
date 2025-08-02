import requests
import json

# First, let's get a token
login_url = "http://localhost:8090/api/auth/token"
# Replace with actual username and password
username = "Goga"
password = "191202"

login_data = {
    "username": username,
    "password": password
}

try:
    # Get token
    login_response = requests.post(login_url, data=login_data)
    print(f"Login Status Code: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        token = token_data.get("access_token")
        print(f"Token: {token}")
        
        # Test the endpoint
        url = "http://localhost:8090/api/auth/users/me/basic"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(url, headers=headers)
        print(f"Endpoint Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    else:
        print(f"Login failed: {login_response.text}")
        
except Exception as e:
    print(f"Error: {e}")

import requests

# Replace with your actual token
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJHb2dhIiwiZXhwIjoxNzQ3OTk5NTMxfQ.MWU0krPe81BHfhNUwilXwHsc-A-id2YXmqLRGefOs2w"

# Test the auth endpoint
auth_url = "http://localhost:8090/api/auth/users/me/basic"
auth_headers = {
    "Authorization": f"Bearer {token}"
}

try:
    auth_response = requests.get(auth_url, headers=auth_headers)
    print(f"Auth endpoint status: {auth_response.status_code}")
    print(f"Auth endpoint response: {auth_response.text}")
except Exception as e:
    print(f"Auth endpoint error: {e}")

# Test the users endpoint
users_url = "http://localhost:8090/api/users/me/basic"
users_headers = {
    "Authorization": f"Bearer {token}"
}

try:
    users_response = requests.get(users_url, headers=users_headers)
    print(f"Users endpoint status: {users_response.status_code}")
    print(f"Users endpoint response: {users_response.text}")
except Exception as e:
    print(f"Users endpoint error: {e}")

import requests

# Use the newly generated token
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJHb2dhIiwiZXhwIjoxNzU0MTM0NDQ0fQ.zQ7hkDvXvsLjc_9hwfgDScGVLCybOQsh8_QJG1Ww1Jo"

# Test the auth endpoint through nginx
auth_url = "http://localhost:8090/api/auth/users/me/basic"
auth_headers = {
    "Authorization": f"Bearer {token}"
}

print("Testing auth endpoint through nginx...")
try:
    auth_response = requests.get(auth_url, headers=auth_headers)
    print(f"Auth endpoint status: {auth_response.status_code}")
    print(f"Auth endpoint response: {auth_response.text}")
except Exception as e:
    print(f"Auth endpoint error: {e}")

# Test the users endpoint through nginx
users_url = "http://localhost:8090/api/users/me/basic"
users_headers = {
    "Authorization": f"Bearer {token}"
}

print("\nTesting users endpoint through nginx...")
try:
    users_response = requests.get(users_url, headers=users_headers)
    print(f"Users endpoint status: {users_response.status_code}")
    print(f"Users endpoint response: {users_response.text}")
except Exception as e:
    print(f"Users endpoint error: {e}")

# Test direct API endpoint
direct_url = "http://localhost:8000/api/auth/users/me/basic"
direct_headers = {
    "Authorization": f"Bearer {token}"
}

print("\nTesting direct API endpoint...")
try:
    direct_response = requests.get(direct_url, headers=direct_headers)
    print(f"Direct endpoint status: {direct_response.status_code}")
    print(f"Direct endpoint response: {direct_response.text}")
except Exception as e:
    print(f"Direct endpoint error: {e}")

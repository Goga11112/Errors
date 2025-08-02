import requests
import time

# Use the newly generated token
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJHb2dhIiwiZXhwIjoxNzU0MTM0NDQ0fQ.zQ7hkDvXvsLjc_9hwfgDScGVLCybOQsh8_QJG1Ww1Jo"

# Test the auth endpoint through nginx
auth_url = "http://nginx/api/auth/users/me"
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

# Test the basic auth endpoint through nginx
auth_basic_url = "http://nginx/api/auth/users/me/basic"
auth_basic_headers = {
    "Authorization": f"Bearer {token}"
}

print("\nTesting auth basic endpoint through nginx...")
try:
    auth_basic_response = requests.get(auth_basic_url, headers=auth_basic_headers)
    print(f"Auth basic endpoint status: {auth_basic_response.status_code}")
    print(f"Auth basic endpoint response: {auth_basic_response.text}")
except Exception as e:
    print(f"Auth basic endpoint error: {e}")

# Test the users endpoint through nginx (this should also work now)
users_url = "http://nginx/api/users/me"
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

import requests

# Test the endpoint
url = "http://localhost:8090/api/auth/users/me/basic"
# You'll need to replace this with a valid token from your application
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJHb2dhIiwiZXhwIjoxNzQ3OTk5NTMxfQ.MWU0krPe81BHfhNUwilXwHsc-A-id2YXmqLRGefOs2w"

headers = {
    "Authorization": f"Bearer {token}"
}

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

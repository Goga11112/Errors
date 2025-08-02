#!/bin/sh
set -e

# Change directory to /app/db
cd /app/db

# Run the initialization script
python first_in_project.py

# Change back to /app directory
cd /app

# Start the uvicorn server with correct module path
exec uvicorn main:app --host 0.0.0.0 --port 8000

#!/bin/sh
set -e

# Start the uvicorn server with correct module path
exec uvicorn main:app --host 0.0.0.0 --port 8000
# Change directory to /app/db
cd /app/db

# Run the initialization script
python first_in_project.py
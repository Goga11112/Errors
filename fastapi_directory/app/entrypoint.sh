#!/bin/sh
set -e

# Function to check if database is ready using Python
wait_for_db_python() {
    echo "Waiting for database to be ready (using Python)..."
    python << EOF
import sys
import time
import psycopg2
from psycopg2 import OperationalError

# Database URL from environment or default
DATABASE_URL = "postgresql://postgres:postgres@db:5432/db_errors"

for i in range(60):  # Try for 60 seconds
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        print("Database is ready (Python check)!")
        sys.exit(0)
    except OperationalError as e:
        print(f"Database not ready, retrying... ({i+1}/60)")
        time.sleep(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        time.sleep(1)

print("Database connection failed after 60 attempts")
sys.exit(1)
EOF
}

# Wait for database to be ready using Python check
wait_for_db_python

# Change directory to /app/db
cd /app/db

# Run the initialization script
python first_in_project.py

# Change back to /app directory
cd /app

# Start the uvicorn server with correct module path
exec uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info

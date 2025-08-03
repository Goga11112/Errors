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

# Function to check if Errors_server exists
wait_for_errors_server() {
    echo "Waiting for Errors_server to be created..."
    python << EOF
import sys
import time
import psycopg2
from psycopg2 import OperationalError

DATABASE_URL = "postgresql://postgres:postgres@db:5432/db_errors"

for i in range(60):  # Try for 60 seconds
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM pg_foreign_server WHERE srvname='errors_server';")
        if cursor.fetchone():
            print("✅ Errors_server exists!")
            sys.exit(0)
        else:
            print(f"Errors_server not found, retrying... ({i+1}/60)")
        time.sleep(1)
    except OperationalError as e:
        print(f"Database error: {e}")
        time.sleep(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        time.sleep(1)

print("❌ Errors_server not found after 60 attempts")
sys.exit(1)
EOF
}

# Wait for database
wait_for_db_python

# Wait for Errors_server (если он создается другим контейнером)
# wait_for_errors_server  # Раскомментируйте, если нужно ждать его

# Run the initialization script
cd /app/db
python first_in_project.py
cd /app

# Start the uvicorn server
exec uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info
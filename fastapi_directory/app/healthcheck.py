import asyncio
import aiohttp
import sys
import os

async def check_api_health():
    """Check if the API is healthy and responding"""
    api_url = os.getenv("HEALTHCHECK_URL", "http://localhost:8000")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{api_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "message" in data and "running" in data["message"]:
                        print("API health check passed")
                        return True
                    else:
                        print(f"API returned unexpected response: {data}")
                        return False
                else:
                    print(f"API returned status code: {response.status}")
                    return False
    except Exception as e:
        print(f"API health check failed with exception: {e}")
        return False

async def check_db_connection():
    """Check if database connection is working"""
    try:
        # Import database modules
        from app.db.database import SessionLocal
        from sqlalchemy import text
        
        # Try to create a session and execute a simple query
        db = SessionLocal()
        result = db.execute(text("SELECT 1"))
        db.close()
        
        print("Database connection check passed")
        return True
    except Exception as e:
        print(f"Database connection check failed: {e}")
        return False

async def main():
    """Main health check function"""
    print("Running health checks...")
    
    api_healthy = await check_api_health()
    db_healthy = await check_db_connection()
    
    if api_healthy and db_healthy:
        print("All health checks passed")
        sys.exit(0)
    else:
        print("Some health checks failed")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

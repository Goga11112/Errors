import os
import sys
from dotenv import load_dotenv
# Добавьте эту строку, чтобы добавить корневую папку проекта в sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

load_dotenv()  # Загружаем переменные окружения из .env

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles



app = FastAPI()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploaded_images")
ABS_UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)

# Ensure upload directory exists with proper permissions
import pathlib
import logging

try:
    pathlib.Path(ABS_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    # Check if directory exists and is writable
    if os.path.exists(ABS_UPLOAD_DIR) and os.access(ABS_UPLOAD_DIR, os.W_OK):
        logging.info(f"Upload directory ensured and writable: {ABS_UPLOAD_DIR}")
    else:
        logging.error(f"Upload directory not accessible: {ABS_UPLOAD_DIR}")
except Exception as e:
    logging.error(f"Failed to create upload directory {ABS_UPLOAD_DIR}: {e}")

# Mount StaticFiles at root level for uploaded_images
app.mount("/uploaded_images", StaticFiles(directory=ABS_UPLOAD_DIR), name="uploaded_images")

# Global exception handler for validation errors
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi.exceptions import RequestValidationError
import json



@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     logging.error(f"Validation error for request {request.url}: {exc.errors()}")
    try:
        body_bytes = await request.body()
        # Convert bytes to string safely
        body_text = body_bytes.decode('utf-8', errors='replace')
    except Exception as e:
        body_text = f"Failed to read body: {e}"
    safe_body = None
    try:
        safe_body = exc.body
        # Ensure safe_body is JSON serializable
        json.dumps(safe_body)
    except Exception:
        safe_body = None
#     logging.error(f"Request body: {body_text}")
    # Convert any bytes in exc.errors() to string to avoid JSON serialization error
    def convert_bytes(obj):
        if isinstance(obj, bytes):
            return obj.decode('utf-8', errors='replace')
        if isinstance(obj, list):
            return [convert_bytes(i) for i in obj]
        if isinstance(obj, dict):
            return {k: convert_bytes(v) for k, v in obj.items()}
        return obj
    safe_errors = convert_bytes(exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": safe_errors, "body": safe_body, "raw_body": body_text},
    )

from app.core.cors import setup_cors
from app.db.database import engine, Base
from app.api.endpoints import router as api_router

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

# Настройка CORS
setup_cors(app)

# Подключение маршрутов API с префиксом "/api"
app.include_router(api_router, prefix="/api")


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Custom API",
        version="1.0.0",
        description="Custom OpenAPI schema",
        routes=app.routes,
    )
    
    # Удаляем local_kw из всех эндпоинтов
    for path in openapi_schema["paths"].values():
        for method in path.values():
            if "parameters" in method:
                method["parameters"] = [
                    param for param in method["parameters"]
                    if param.get("name") != "local_kw"
                ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
async def root():
    return {"message": "FastAPI server is running"}


@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    return response
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

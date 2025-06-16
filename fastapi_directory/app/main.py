# Создание приложения FastAPI
import sys
import os

print("sys.path:", sys.path)
print("Current working directory:", os.getcwd())

# Добавляем корневую папку проекта в sys.path для корректного импорта
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI
from fastapi_directory.app.core.cors import setup_cors
from fastapi_directory.app.db.database import engine, Base
from fastapi_directory.app.api.endpoints import router as api_router

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

# Создание приложения FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI()

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
        description="Custom OpenAPI schema without local_kw parameter",
        routes=app.routes,
    )
    # Remove 'local_kw' parameter from all paths if present
    for path in openapi_schema.get("paths", {}).values():
        for method in path.values():
            parameters = method.get("parameters", [])
            method["parameters"] = [param for param in parameters if param.get("name") != "local_kw"]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
async def root():
    return {"message": "FastAPI server is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

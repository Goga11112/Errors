from fastapi import FastAPI
from app.db.database import engine, Base
from app.api.endpoints import router as api_router

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

# Создание приложения FastAPI
app = FastAPI()

# Подключение маршрутов API
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

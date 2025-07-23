# Dockerfile для backend (FastAPI)
FROM python:3.13.5

# Установка зависимостей системы
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Установка рабочей директории
WORKDIR /app

# Копируем файлы зависимостей
COPY requirements.txt /app/requirements.txt

# Устанавливаем зависимости Python
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код backend
COPY . /app

# Открываем порт
EXPOSE 8000

# Копируем entrypoint скрипт из папки app
COPY app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Используем entrypoint скрипт для запуска
ENTRYPOINT ["/app/entrypoint.sh"]

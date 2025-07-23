# Dockerfile для frontend (React)
FROM node:16

# Установка рабочей директории
WORKDIR /app

# Установка xdg-utils для устранения ошибки с xdg-open
# Удалена из-за проблем с устаревшими репозиториями
# RUN apt-get update && apt-get install -y xdg-utils

# Копируем только package.json, так как package-lock.json отсутствует
COPY package.json ./

# Устанавливаем зависимости с выводом логов
RUN npm install --verbose

# Копируем весь исходный код frontend
COPY . .

# Открываем порт
EXPOSE 3000

# Запуск приложения с переменной окружения BROWSER=none, чтобы не пытаться открыть браузер
CMD ["sh", "-c", "BROWSER=none npm start"]

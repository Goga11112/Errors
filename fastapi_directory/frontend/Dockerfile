# Dockerfile для frontend (React)
FROM node:16

# Установка рабочей директории
WORKDIR /app

# Копируем только package.json, так как package-lock.json отсутствует
COPY package.json ./

# Устанавливаем зависимости с выводом логов
RUN npm install --verbose

# Копируем весь исходный код frontend
COPY . .

# Собираем фронтенд в production
RUN npm run build

# Используем nginx для сервировки статических файлов
FROM nginx:alpine

COPY --from=0 /app/build /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

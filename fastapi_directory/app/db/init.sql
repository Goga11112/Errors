-- Установка расширения postgres_fdw в системную БД template1
\connect template1
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Создание основной базы данных
CREATE DATABASE db_errors;

-- Подключение к новой БД и установка расширения в ней
\connect db_errors
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Дополнительные настройки (если нужны)
ALTER DATABASE db_errors SET search_path TO public, extensions;
-- Инициализация для PostgreSQL 15
-- Не нужно подключаться к template1, так как скрипт выполняется в целевой БД

-- Создаем расширение в текущей БД (уже подключены к db_errors)
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Дополнительные настройки
ALTER DATABASE db_errors SET search_path TO public, extensions;

-- Создаем сервер (если нужно)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_foreign_server WHERE srvname = 'errors_server') THEN
        CREATE SERVER errors_server 
        FOREIGN DATA WRAPPER postgres_fdw 
        OPTIONS (host 'db', dbname 'db_errors', port '5432');
        
        CREATE USER MAPPING IF NOT EXISTS FOR postgres
        SERVER errors_server 
        OPTIONS (user 'postgres', password 'postgres');
    END IF;
END $$;
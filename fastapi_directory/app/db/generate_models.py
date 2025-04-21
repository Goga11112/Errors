import psycopg2
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import declarative_base

Base = declarative_base()  # Updated to use the correct import


def generate_models():
    # Подключение к базе данных
    conn = psycopg2.connect(
        dbname='db_errors',
        user='Goga',
        password='191202',
        host='localhost',
        options="-c client_encoding=utf8"  # Установка кодировки
    )

    cursor = conn.cursor()

    # Получение списка таблиц
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = cursor.fetchall()

    for table in tables:
        table_name = table[0]
        print(f"Обработка таблицы: {table_name}")

        # Получение информации о столбцах
        cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{table_name}'")
        columns = cursor.fetchall()

        # Генерация модели
        model_str = f"class {table_name.capitalize()}(Base):\n"
        model_str += f"    __tablename__ = '{table_name}'\n"

        for column in columns:
            column_name, data_type = column
            if data_type == 'integer':
                model_str += f"    {column_name} = Column(Integer, primary_key=True)\n"
            elif data_type == 'character varying':
                model_str += f"    {column_name} = Column(String, index=True)\n"
            elif data_type == 'double precision':
                model_str += f"    {column_name} = Column(Float)\n"
            # Добавьте другие типы данных по мере необходимости

        # Сохранение модели в файл
        with open(f"fastapi_directory/app/models/{table_name}.py", 'w') as f:
            f.write(model_str)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    generate_models()

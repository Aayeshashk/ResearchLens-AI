from sqlalchemy import text

from app.db import SessionLocal


try:
    db = SessionLocal()

    result = db.execute(text("SELECT 1"))

    print("Database session created successfully!")
    print("Result:", result.scalar())

    db.close()

    print("Database session closed successfully!")

except Exception as e:
    print("Database session test failed!")
    print(e)
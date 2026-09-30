import os

from dotenv import load_dotenv


load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is not set")


JWT_ALGORITHM = "HS256"

JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60
SUPABASE_URL = os.getenv("SUPABASE_URL")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set")

SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
)
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        "SUPABASE_SERVICE_ROLE_KEY is not set"
    )
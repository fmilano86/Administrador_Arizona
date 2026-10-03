from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"

settings = Settings()

# Este archivo lee las variables de tu .env (DATABASE_URL, JWT_SECRET) una sola vez y las deja disponibles para todo el backend como settings.database_url, settings.jwt_secret, etc.
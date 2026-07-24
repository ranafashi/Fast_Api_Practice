from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str
    database_name: str
    SECRET_KEY: str
    ALGORITHM: str
    EXP_TIME:int
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    NOTIFY_EMAIL: str
    
    class Config:
        env_file = ".env"


settings = Settings()

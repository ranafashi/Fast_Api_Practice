from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str
    database_name: str
    SECRET_KEY: str
    ALGORITHM: str
    EXP_TIME:int

    class Config:
        env_file = ".env"


settings = Settings()

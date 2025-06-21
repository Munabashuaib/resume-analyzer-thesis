
import os

class Config:
    SECRET_KEY = 'super_secret_key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///resume_analyzer.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Required for cross-origin cookies
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = False  # Set True if using HTTPS




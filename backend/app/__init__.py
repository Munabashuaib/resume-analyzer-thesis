from flask import Flask
from flask_cors import CORS
from app.extensions import db, login_manager
from app.routes import auth_routes, resume_routes, job_routes, admin_routes
from app.config import Config
from app.models import User
from flask_session import Session  


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    Session(app)

    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    app.register_blueprint(auth_routes.auth_bp, url_prefix='/api/auth')
    app.register_blueprint(resume_routes.resume_bp, url_prefix='/api/resume')
    app.register_blueprint(job_routes.job_bp, url_prefix='/api/jobs')
    app.register_blueprint(admin_routes.admin_bp, url_prefix="/api/admin")
    
    return app





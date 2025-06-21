from .extensions import db                   # SQLAlchemy instance
from flask_login import UserMixin            # For handling logged-in user sessions
from datetime import datetime                # Used for timestamps

# -----------------------------------------------
# BaseModel: Adds a universal to_dict method for easy JSON conversion

class BaseModel:
    def to_dict(self):
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if hasattr(value, 'isoformat'):  # Convert datetime fields to ISO string
                result[column.name] = value.isoformat()
            else:
                result[column.name] = value
        return result

# -----------------------------------------------
# User Model: Stores registered users (seekers, employers, admins)

class User(UserMixin, BaseModel, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    
    # One-to-many relationship: A user can upload multiple resumes
    resumes = db.relationship('Resume', backref='user', lazy=True)
    
    # One-to-many relationship: A user can apply to multiple jobs
    applications = db.relationship('Application', backref='user', lazy=True)
    
    # Role-based access: seeker, employer, or admin
    role = db.Column(db.String(20), default="seeker")
    
    is_active = db.Column(db.Boolean, default=True)

# -----------------------------------------------
# Job Model: Stores all posted jobs (by employers or datasets)

class Job(BaseModel, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    company = db.Column(db.String(120), nullable=True)
    skills = db.Column(db.Text, nullable=True)        # Optional field to store desired job skills

    # One-to-many: Each job can have many applications
    applications = db.relationship('Application', backref='job', lazy=True)

    # Link to the user (employer) who posted this job
    posted_by = db.Column(db.Integer, db.ForeignKey('user.id'))

    domain = db.Column(db.String(100))                # Used for domain-based matching

# -----------------------------------------------
# Resume Model: Stores uploaded resumes and parsed content

class Resume(BaseModel, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)  # Original filename
    content = db.Column(db.Text, nullable=False)          # Full parsed text from resume

    # ForeignKey link to the owner (user)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Timestamp for resume uploads
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------
# Application Model: Links job seekers to jobs they applied for

class Application(BaseModel, db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Foreign keys: who applied, to which job, with which resume
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'))
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'))

    match_score = db.Column(db.Float)                     # Score computed during matching
    applied_on = db.Column(db.DateTime, default=datetime.utcnow)

    # Status flow: pending → accepted/rejected
    status = db.Column(db.String(20), default="Pending")

# -----------------------------------------------
# Notification Model: Used for showing alerts to users (e.g., job accepted/rejected)

class Notification(BaseModel, db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Link to the user the notification is for
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    message = db.Column(db.String(255), nullable=False)   # Message content (e.g., "Your application was accepted")
    is_read = db.Column(db.Boolean, default=False)        # Unread/read flag
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from app.extensions import db
from app.models import User
from app.models import Notification


auth_bp = Blueprint('auth', __name__)

# Register a new user
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = generate_password_hash(data['password'])
    role = data.get('role', 'seeker')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_pw,
        role=role
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})

# Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        login_user(user)
        
        # Force session creation (optional but helpful)
        session['user_id'] = user.id
        session.modified = True

        # DEBUG: print session and cookies
        print("Login successful:")
        print(f"  - User: {user.email}")
        print(f"  - Session contents: {dict(session)}")
        print(f"  - Request cookies: {dict(request.cookies)}")

        return jsonify({
            "message": "Login successful",
            "user_id": user.id,
            "role": user.role
        })

    return jsonify({"error": "Invalid credentials"}), 401

# Logout
@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    print("User logged out")
    return jsonify({"message": "Logged out successfully"})

# Auth status check
@auth_bp.route('/status', methods=['GET'])
def auth_status():
    if current_user.is_authenticated:
        return jsonify({
            "logged_in": True,
            "user_id": current_user.id,
            "username": current_user.username,
            "role": current_user.role
        })
    return jsonify({"logged_in": False}), 401

@auth_bp.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    notes = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([{
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    } for n in notes])

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_user_profile():
    from app.models import Resume, Application, Job
    user = current_user

    resumes = Resume.query.filter_by(user_id=user.id).order_by(Resume.created_at.desc()).all()
    resume_list = [
        {
            "filename": getattr(r, "filename", "Unnamed Resume"),
            "created_at": r.created_at.strftime('%b %d, %Y') if r.created_at else "N/A"
        }
        for r in resumes
    ]

    apps = Application.query.filter_by(user_id=user.id).all()
    last_app = apps[0] if apps else None
    last_application = None
    if last_app:
        job = Job.query.get(last_app.job_id)
        last_application = {
            "title": job.title,
            "company": job.company,
            "date": getattr(last_app, "created_at", None).strftime('%b %d, %Y') if getattr(last_app, "created_at", None) else "N/A"
        }

    return jsonify({
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "resume_count": len(resumes),
        "application_count": len(apps),
        "resumes": resume_list,
        "last_application": last_application
    })


@auth_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.json
    user = current_user

    username = data.get("username")
    if username:
        user.username = username

    # Optional: let users change email (add validation if needed)
    email = data.get("email")
    if email:
        user.email = email

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})



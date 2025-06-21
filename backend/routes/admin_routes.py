from flask import Blueprint, jsonify
from app.models import User, Job
from app.extensions import db
from flask_login import login_required
from app.utils.decorators import role_required
from flask import request



admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/users', methods=['GET'])
@login_required
@role_required('admin')
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role": u.role,
        "is_active": u.is_active
    } for u in users])


@admin_bp.route('/jobs', methods=['GET'])
@login_required
@role_required('admin')
def get_jobs():
    jobs = Job.query.all()
    return jsonify([{
        "id": j.id,
        "title": j.title,
        "description": j.description
    } for j in jobs])

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
@role_required('admin')
def update_user(user_id):
    data = request.json
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)
    user.is_active = data.get("is_active", user.is_active)
    db.session.commit()
    return jsonify({"message": "User updated successfully"})

@admin_bp.route('/user-applications/<int:user_id>', methods=['GET'])
@login_required
@role_required('admin')
def get_user_applications(user_id):
    from app.models import Application, Job, Resume
    apps = Application.query.filter_by(user_id=user_id).all()

    result = []
    for app in apps:
        job = Job.query.get(app.job_id)
        resume = Resume.query.get(app.resume_id)
        result.append({
            "job_title": job.title if job else "N/A",
            "match_score": app.match_score,
            "status": app.status,
            "applied_on": app.applied_on.strftime('%Y-%m-%d'),
            "resume_name": resume.filename if resume else "Unknown"
        })

    return jsonify(result)

@admin_bp.route('/stats', methods=['GET'])
@login_required
@role_required('admin')
def get_admin_stats():
    total_users = User.query.count()
    total_jobs = Job.query.count()
    from app.models import Application
    total_apps = Application.query.count()
    total_employers = User.query.filter_by(role="employer").count()
    total_seekers = User.query.filter_by(role="seeker").count()

    return jsonify({
        "total_users": total_users,
        "total_jobs": total_jobs,
        "total_applications": total_apps,
        "total_employers": total_employers,
        "total_seekers": total_seekers
    })



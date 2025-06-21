from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from app.extensions import db
from app.models import Job, Application, Resume, User, Notification
from app.ai_model import match_resume_to_jobs, match_resume_with_fallback
from app.utils.decorators import role_required
from app.resume_parser import clean_and_filter_skills, map_skills_to_domains, extract_text_from_resume, extract_keywords_from_text
from werkzeug.utils import secure_filename
import os
import csv
import json

# Create a Blueprint for all job-related routes
job_bp = Blueprint('jobs', __name__)

@job_bp.route('/add', methods=['POST'])
@role_required("employer")                 # Only employers can post jobs
def add_job():
    data = request.json
    new_job = Job(
        title=data['title'],
        description=data['description'],
        company=data.get('company'),
        skills=data.get('skills'),
        domain=data.get('domain', 'unspecified'),
        posted_by=current_user.id
    )
    db.session.add(new_job)
    db.session.commit()
    return jsonify({"message": "Job added successfully"})

@job_bp.route("/list", methods=["GET"])
@login_required
def list_jobs():
    # Normalize filters
    source_filter = request.args.get("source", "all").lower()
    domain_filter = request.args.get("domain", "All Domains")

    # Load employer-posted jobs from DB
    jobs = Job.query.all()
    db_jobs = [
        {
            "id": job.id,
            "title": job.title,
            "company": job.company or "Unknown",
            "description": job.description,
            "source": "employer",
            "domain": (job.domain or "unspecified").lower(),
        }
        for job in jobs
    ]

    # Load fallback jobs from CSV
    dataset_path = os.path.join(os.path.dirname(__file__), "../../scripts/jobs_curated.csv")
    fallback_jobs = []
    with open(dataset_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            fallback_jobs.append({
                "id": -1,
                "title": row["title"],
                "company": row.get("company") or "Imported CSV",
                "description": row["description"],
                "source": "dataset",
                "domain": row.get("domain", "").lower() or "unspecified",
            })

    # Combine all jobs
    all_jobs = db_jobs + fallback_jobs

    # Apply source filter
    if source_filter != "all":
        all_jobs = [j for j in all_jobs if j["source"] == source_filter]

    # Apply domain filter
    if domain_filter != "All Domains":
        domain_filter = domain_filter.lower()
        all_jobs = [j for j in all_jobs if j["domain"] == domain_filter]

    return jsonify(all_jobs)

@job_bp.route('/domains', methods=['GET'])
def list_domains():
    with open("datasets/skill_domains_extended.json") as f:
        skill_domains = json.load(f)
    domains = sorted(set(skill_domains.values()))
    return jsonify(["All Domains"] + domains)

@job_bp.route('/apply/<int:job_id>', methods=['POST'])
@login_required
def apply_to_job(job_id):
    print("Trying to apply to job_id:", job_id)  # DEBUG
    job = Job.query.get_or_404(job_id)
    print("Found job:", job)  # DEBUG
    resume = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume:
        return jsonify({"error": "No resume found"}), 404
    
    print(f"[DEBUG] Job object: {job} | Type: {type(job)} | Description: {getattr(job, 'description', None)}")

    matches = match_resume_with_fallback(resume.content, [job])
    print("[DEBUG] Matches returned:", matches)

    if not matches or all(m["match_score"] < 0.05 for m in matches):  # 5% threshold in 0–1 scale
        return jsonify({"error": "No suitable match found for this job."}), 400


    score = matches[0]['match_score']
    print(f"[DEBUG] Storing match_score = {score}")
    application = Application(
        user_id=current_user.id,
        job_id=job.id,
        resume_id=resume.id,
        match_score=score,
        status="Pending"
    )
    db.session.add(application)

    employer = User.query.get(job.posted_by)
    if employer:
        db.session.add(Notification(
            user_id=employer.id,
            message=f"{current_user.username} applied to your job post: {job.title}"
        ))

    # notify admins
    admins = User.query.filter_by(role="admin").all()
    for admin in admins:
        print("Creating admin notification for:", admin.username)
        db.session.add(Notification(
            user_id=admin.id,
            message=f"{current_user.username} applied to '{job.title}' (posted by {employer.username if employer else 'unknown'})"
        ))

    db.session.commit()
    return jsonify({"message": "Applied successfully", "match_score": score})

@job_bp.route('/applied', methods=['GET'])
@login_required
def get_applied_jobs():
    apps = Application.query.filter_by(user_id=current_user.id).all()
    result = []
    for app in apps:
        job = Job.query.get(app.job_id)
        result.append({
            "id": app.id,
            "job_title": job.title,
            "company": job.company,
            "match_score": round(app.match_score * 100, 2),  
            "status": app.status
        })
    return jsonify({"applications": result})

@job_bp.route('/employer', methods=['GET'])
@login_required
def get_employer_jobs():
    if current_user.role != 'employer':
        return jsonify({"error": "Unauthorized"}), 403
    jobs = Job.query.filter_by(posted_by=current_user.id).all()
    return jsonify({"jobs": [job.to_dict() for job in jobs]})

@job_bp.route('/applications/<int:job_id>', methods=['GET'])
@login_required
def view_applications(job_id):
    if current_user.role != 'employer':
        return jsonify({"error": "Unauthorized"}), 403

    job = Job.query.get(job_id)
    if job.posted_by != current_user.id:
        return jsonify({"error": "Not your job"}), 403

    applications = Application.query.filter_by(job_id=job_id).all()
    return jsonify({
        "applicants": [{
            "id": app.id,
            "user_id": app.user_id,
            "match_score": round(app.match_score * 100, 2),  # Show percentage
            "status": app.status,
            "resume_text": Resume.query.get(app.resume_id).content if app.resume_id else ""
        } for app in applications]
    })

@job_bp.route('/delete/<int:job_id>', methods=['DELETE'])
@login_required
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)

    if current_user.role not in ['admin', 'employer']:
        return jsonify({"error": "Unauthorized"}), 403

    if current_user.role == 'employer' and job.posted_by != current_user.id:
        return jsonify({"error": "Not allowed to delete this job"}), 403

    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted successfully."})

@job_bp.route('/check-match/<int:job_id>', methods=['GET'])
@login_required
def check_match_for_job(job_id):
    job = Job.query.get_or_404(job_id)
    resume = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.id.desc()).first()
    if not resume:
        return jsonify({"error": "No resume found"}), 404

    matches = match_resume_to_jobs(resume.content, [job])
    if not matches:
        return jsonify({
            "match_score": 0,
            "matched_skills": [],
            "matched_domains": {}
        }), 200

    return jsonify(matches[0])

@job_bp.route('/applications/update-status/<int:application_id>', methods=['POST'])
@login_required
def update_application_status(application_id):
    if current_user.role != 'employer':
        return jsonify({"error": "Unauthorized"}), 403

    app = Application.query.get_or_404(application_id)
    job = Job.query.get(app.job_id)

    if job.posted_by != current_user.id:
        return jsonify({"error": "Not your job"}), 403

    new_status = request.json.get("status")
    if new_status not in ["Accepted", "Rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    app.status = new_status

    # Notify applicant
    db.session.add(Notification(
        user_id=app.user_id,
        message=f"Your application for {job.title} was {new_status.lower()}."
    ))

    # Notify admins
    admins = User.query.filter_by(role="admin").all()
    for admin in admins:
        print("Creating admin notification for:", admin.username)
        db.session.add(Notification(
            user_id=admin.id,
            message=f"{current_user.username} {new_status.lower()} application ID {app.id} for job '{job.title}'"
        ))

    db.session.commit()
    return jsonify({"message": f"Application {new_status.lower()}."})

@job_bp.route('/parse-pdf-description', methods=['POST'])
@login_required
@role_required("employer")
def parse_pdf_description():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join("uploads", filename)
    file.save(path)

    content = extract_text_from_resume(path)
    return jsonify({"text": content.strip()})







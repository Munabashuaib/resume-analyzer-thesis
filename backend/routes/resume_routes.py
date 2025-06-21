
import os
import json
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models import Resume, Job
from app.resume_parser import (
    extract_text_from_resume,
    parse_resume_fields,
    parse_resume_fields_from_text
)
from app.ai_model import (
    hybrid_match_resume_to_jobs,         # Main job-matching algorithm
    suggest_resume_improvements          # Skill suggestions (AI fallback)
)
from app.enhancer import suggest_resume_improvements  # Enhancer logic (if separated)

# === Blueprint Setup ===
resume_bp = Blueprint('resume', __name__)
UPLOAD_FOLDER = 'uploads'  # Directory to save uploaded resumes


# ----------------------------------------------------------
# Route: Upload Resume
# Parses, stores, and matches the uploaded resume to jobs

@resume_bp.route('/upload', methods=['POST'])
@login_required
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Secure and save uploaded file
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Extract raw text from the resume file (PDF/DOCX)
    content = extract_text_from_resume(filepath)

    # Store resume content in database
    new_resume = Resume(
        filename=filename,
        content=content,
        user_id=current_user.id
    )
    db.session.add(new_resume)
    db.session.commit()

    # Retrieve the latest resume from this user
    latest_resume = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.id.desc()).first()

    # Match resume to all available jobs using hybrid model
    jobs = Job.query.all()
    matches = hybrid_match_resume_to_jobs(latest_resume.content, jobs)

    # Parse resume into structured data (skills, education, etc.)
    parsed_resume_data = parse_resume_fields(filepath)

    return jsonify({
        "message": "Resume uploaded and parsed successfully",
        "matches": matches,
        "resume_summary": parsed_resume_data
    })


# ----------------------------------------------------------
# Route: Get All Resumes for the Logged-in User

@resume_bp.route('/user', methods=['GET'])
@login_required
def get_user_resumes():
    resumes = Resume.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        "resumes": [{"id": r.id, "filename": r.filename} for r in resumes]
    })


# ----------------------------------------------------------
# Route: Get Matching Jobs for User's Latest Resume
# Uses hybrid matching approach

@resume_bp.route('/matches', methods=['GET'])
@login_required
def get_matches():
    # Get latest resume
    resume = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume or not resume.content:
        return jsonify({"matches": []})

    # Match resume to all jobs
    job_list = Job.query.all()
    matches = hybrid_match_resume_to_jobs(resume.content, job_list)

    return jsonify({"matches": matches})


# ----------------------------------------------------------
# Route: Resume Enhancer
# Suggests missing domain-specific skills based on selected domain

@resume_bp.route('/enhance', methods=['POST'])
def enhance_resume():
    import logging
    logging.basicConfig(level=logging.DEBUG)

    file = request.files.get("file")
    domain = request.form.get("domain", "").lower()

    # Validate inputs
    if not file or not domain:
        return jsonify({"error": "Missing file or domain"}), 400

    # Save file temporarily for parsing
    os.makedirs("temp", exist_ok=True)
    filename = secure_filename(file.filename)
    filepath = os.path.join("temp", filename)
    file.save(filepath)

    try:
        # Extract and parse resume
        resume_text = extract_text_from_resume(filepath)
        parsed = parse_resume_fields_from_text(resume_text)
        logging.debug("Parsed resume skills: %s", parsed.get("skills", []))

        # Load domain-to-skills mapping from dataset
        with open("datasets/skill_domains_extended.json", encoding="utf-8") as f:
            domain_map = json.load(f)

        # Filter relevant domain skills
        domain_skills = [skill for skill, d in domain_map.items() if d.lower() == domain]
        logging.debug("Domain skills for '%s': %s", domain, domain_skills[:10])

        # Suggest skills not already in the resume
        resume_skills = [s.lower().strip() for s in parsed.get("skills", [])]
        suggestions = [s for s in domain_skills if s.lower().strip() not in resume_skills]

        # Return top 5 or default soft skills if none found
        suggestions = suggestions[:5] or ["communication", "teamwork", "problem solving"]
        logging.debug("Final suggestions: %s", suggestions)

        return jsonify({"suggestions": suggestions})

    except Exception as e:
        logging.exception("Error enhancing resume:")
        return jsonify({"error": "Enhancer failed", "details": str(e)}), 500

    finally:
        os.remove(filepath)  # Clean up temporary file





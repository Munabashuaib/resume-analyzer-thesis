# app/enhancer.py

def suggest_resume_improvements(parsed_resume, domain_skills):
    resume_skills = [s.lower().strip() for s in parsed_resume.get("skills", [])]
    missing_skills = [s for s in domain_skills if s.lower().strip() not in resume_skills]

    return missing_skills[:5]  # limit it if needed

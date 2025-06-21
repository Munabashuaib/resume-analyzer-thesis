from app import create_app
from app.extensions import db
from app.models import Job, User
from werkzeug.security import generate_password_hash
from app.resume_parser import map_skills_to_domains

def seed_jobs():
    app = create_app()
    with app.app_context():
        # Create employer user
        employer = User.query.filter_by(email="employer1@example.com").first()
        if not employer:
            employer = User(
                username="employer1",
                email="employer1@example.com",
                password=generate_password_hash("password123"),
                role="employer"
            )
            db.session.add(employer)
            db.session.commit()

        jobs_data = [
            {
                "title": "Software Engineer",
                "company": "TechNova Inc",
                "description": "Python, Flask, REST API development, problem-solving",
                "skills": "Python, Flask, REST API",
            },
            {
                "title": "Frontend Developer",
                "company": "Webify Solutions",
                "description": "React, JavaScript, CSS, HTML, frontend design",
                "skills": "React, JavaScript, HTML, CSS",
            },
            {
                "title": "Data Analyst",
                "company": "DataWiz Analytics",
                "description": "Excel, data analysis, SQL, visualization, statistics",
                "skills": "Excel, SQL, Statistics",
            },
        ]

        jobs = []
        for job in jobs_data:
            skill_list = [s.strip().lower() for s in job["skills"].split(",")]
            domain_map = map_skills_to_domains(skill_list)
            domain = list(domain_map.keys())[0] if domain_map else "unspecified"

            jobs.append(Job(
                title=job["title"],
                company=job["company"],
                description=job["description"],
                skills=job["skills"],
                domain=domain,
                posted_by=employer.id
            ))

        db.session.bulk_save_objects(jobs)
        db.session.commit()
        print("Sample jobs seeded and linked to employer with proper domains!")

if __name__ == "__main__":
    seed_jobs()


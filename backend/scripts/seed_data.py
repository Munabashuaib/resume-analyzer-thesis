import sys
import os

# Adds the backend root to the Python path so `app` can be found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models import Job


app = create_app()

sample_jobs = [
    {"title": "Backend Developer", "description": "Python, Flask, SQL required", "company": "Tech Co", "skills": "Python, Flask, SQL"},
    {"title": "Frontend Developer", "description": "React, JS, HTML, CSS", "company": "Creative Co", "skills": "React, HTML, CSS"}
]

with app.app_context():
    for job in sample_jobs:
        db.session.add(Job(**job))
    db.session.commit()
    print("Sample jobs seeded.")

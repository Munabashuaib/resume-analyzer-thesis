from app import create_app
from app.extensions import db
from app.models import Job  # ensures Job is imported

app = create_app()

with app.app_context():
    db.create_all()
    print("Tables created successfully.")


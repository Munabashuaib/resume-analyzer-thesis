import pandas as pd
from app import create_app
from app.extensions import db
from app.models import Resume, Job
from app.ai_model import match_resume_to_jobs


app = create_app()
app.app_context().push()

# Params
POSITIVE_THRESHOLD = 0.7
NEGATIVE_THRESHOLD = 0.3
MAX_POSITIVES_PER_RESUME = 3
MAX_NEGATIVES_PER_RESUME = 3

rows = []
resumes = Resume.query.all()
jobs = Job.query.all()

for resume in resumes:
    resume_text = resume.content or ""
    if not resume_text:
        continue

    match_results = match_resume_to_jobs(resume_text, jobs)

    # Sort by score descending
    match_results.sort(key=lambda x: x['match_score'], reverse=True)


    # Top N = Positives
    positives = [r for r in match_results if r['match_score'] >= POSITIVE_THRESHOLD][:MAX_POSITIVES_PER_RESUME]
    negatives = [r for r in match_results if r['match_score'] <= NEGATIVE_THRESHOLD][:MAX_NEGATIVES_PER_RESUME]


    # Bottom N = Negatives
    negatives = [r for r in reversed(match_results) if r['match_score'] <= NEGATIVE_THRESHOLD][:MAX_NEGATIVES_PER_RESUME]

    for match in positives:
        job = Job.query.get(match['job_id'])
        job_desc = job.description if job else "No description"
        rows.append({
            "resume_text": resume_text,
            "job_text": job_desc,
            "label": 1
        })

for match in negatives:
        job = Job.query.get(match['job_id'])
        job_desc = job.description if job else "No description"
        rows.append({
            "resume_text": resume_text,
            "job_text": job_desc,
            "label": 0
        })



# Save to CSV
df = pd.DataFrame(rows)
df.to_csv("training_data.csv", index=False)
print(f"Done. Saved {len(df)} examples to training_data.csv")

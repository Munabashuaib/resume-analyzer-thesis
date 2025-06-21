import csv
from app.models import Job

def load_jobs_from_csv(path):
    jobs = []
    try:
        with open(path, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                if row.get("title") and row.get("description"):
                    job = Job(
                        id=10000 + idx,  # use a high number to avoid ID clash
                        title=row["title"],
                        company=row.get("company", "Imported CSV"),
                        description=row["description"],
                        source="csv"
                    )
                    jobs.append(job)
    except Exception as e:
        print(f"[CSV Load Error] {e}")
    return jobs

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ['pdf', 'docx']



# import pandas as pd
# import re
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

# skills_df = pd.read_csv('datasets/skills.csv')
# skills_list = skills_df['skills'].dropna().str.lower().tolist()

# def extract_skills_from_text(text):
#     found = []
#     for skill in skills_list:
#         if re.search(r'\b' + re.escape(skill) + r'\b', text.lower()):
#             found.append(skill)
#     return list(set(found))

# def calculate_match_score(resume_skills, job_description):
#     combined = ' '.join(resume_skills)
#     tfidf = TfidfVectorizer().fit_transform([combined, job_description])
#     return cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]


#working copy#

# import pandas as pd
# import re
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

# skills_df = pd.read_csv('datasets/skills.csv')
# skills_list = skills_df['skills'].dropna().str.lower().tolist()

# def extract_skills_from_text(text):
#     found = []
#     for skill in skills_list:
#         if re.search(r'\b' + re.escape(skill) + r'\b', text.lower()):
#             found.append(skill)
#     return list(set(found))

# def calculate_match_score(resume_skills, job_description):
#     combined = ' '.join(resume_skills)
#     tfidf = TfidfVectorizer().fit_transform([combined, job_description])
#     return cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]

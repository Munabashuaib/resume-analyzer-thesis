
# AI-Powered Resume Analyzer for Job Matching 

This system analyzes uploaded resumes and recommends the most relevant jobs using three matching techniques:
- TF-IDF + Cosine Similarity
- Sentence Embeddings using MiniLM
- A final Hybrid Model (Skills + Domain + Embeddings)

---

## System Features
- Resume upload and parsing
- Semantic job matching using NLP
- Admin, Employer, and Seeker roles
- Resume enhancer and application tracker
- Notifications and user dashboards

---

## Folder Structure
```
Thesisproject/
├── backend/       → Flask API, models, matching logic
├── frontend/      → React interface with MUI & Tailwind
├── README.md      → This file
```
---

## How to Run the Project

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python scripts/init_db.py
python scripts/seed_data.py
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

> Make sure the backend runs on port `5000` and frontend on `3000`. They are connected using CORS.

---

## Evaluation
- Evaluation scripts:
  - `evaluate_matching.py`
  - `evaluate_randomized.py`
- Metrics used:
  - Precision
  - Recall
  - F1 Score
  - MRR

---

## Sample Login Credentials
| Role      | Email / Username | Password  |
|-----------|------------------|-----------|
| Admin     | admin            | admin123  |
| Employer  | employer         | emp123    |
| Job Seeker| jobseeker        | seeker123 |

---

## Thesis Info
This project is part of my Bachelor's thesis titled:  
**"AI-Powered Resume Analyzer for Job Matching"**  
Submitted to [Your University Name], June 2025.

GitHub Link: https://github.com/Munabashuaib/resume-analyzer-thesis

---

## Notes
- Developed using: Flask, React, SentenceTransformers, SQLite
- Preloaded with sample resumes, jobs, and models for quick testing

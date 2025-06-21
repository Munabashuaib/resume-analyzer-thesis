#from sklearn.feature_extraction.text import TfidfVectorizer
#from sklearn.metrics.pairwise import cosine_similarity


import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer           # Used for TF-IDF vectorization
from sklearn.metrics.pairwise import cosine_similarity                # Computes similarity between resume/job vectors
from sentence_transformers import SentenceTransformer, util          # Semantic embedding model and cosine util
from nltk.tokenize import word_tokenize                               # Tokenizer for simple text preprocessing
from app.utils.utils import load_jobs_from_csv                        # Loads fallback job list from CSV
from .resume_parser import parse_resume_fields, clean_and_filter_skills, extract_skills  # Resume parsing helpers

# --- Load the fine-tuned SentenceTransformer model (trained on resume-job pairs) ---
semantic_model = SentenceTransformer("models/trained_resume_model")

# -------------------------------------------
# Utility Function: Skill Matching

# Matches parsed resume skills against words in a job description
def get_matched_skills(resume_skills, job_description):
    job_words = set(word_tokenize(job_description.lower()))  # Lowercase and tokenize job description
    return [skill for skill in resume_skills if skill.lower() in job_words]  # Match each skill to job words

# Re-parses resume text using lightweight parsing (e.g., only skills)
def parse_resume_fields_from_text(text):
    skills = clean_and_filter_skills(extract_skills(text))  # Basic skill extraction and filtering
    data = {
        "skills": skills
    }
    return data 

# -------------------------------------------
# Matching Approach 1: TF-IDF + Cosine Similarity

# Calculates similarity between resume and job descriptions using TF-IDF
def match_resume_to_jobs(resume_text, jobs, top_k=5):
    tfidf = TfidfVectorizer(stop_words="english")  # Remove common stopwords
    job_texts = [job.description if hasattr(job, "description") else job["description"] for job in jobs]
    tfidf_matrix = tfidf.fit_transform(job_texts + [resume_text])  # Vectorize all jobs + resume
    scores = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).flatten()  # Cosine sim of resume vs each job

    max_score = max(scores) if scores.any() else 1.0  # Avoid division by zero
    sorted_indices = scores.argsort()[::-1]  # Sort jobs by descending similarity
    parsed = parse_resume_fields_from_text(resume_text)
    resume_skills = parsed.get("skills", [])

    results = []
    for idx in sorted_indices[:top_k]:
        job = jobs[idx]
        job_id = job.id if hasattr(job, "id") else job.get("id", idx)
        job_title = job.title if hasattr(job, "title") else job.get("title", "Untitled")
        job_description = job.description if hasattr(job, "description") else job["description"]

        matched = get_matched_skills(resume_skills, job_description)
        normalized_score = (scores[idx] / max_score)  # Normalize scores to [0–1]
        results.append({
            "job_id": job_id,
            "job_title": job_title,
            "match_score": round(normalized_score, 4),
            "matched_skills": matched
        })
    return results

# -------------------------------------------
# Matching Approach 2: Semantic Embeddings (BERT-based)

# Uses SentenceTransformer embeddings to compare semantic similarity
def semantic_match_resume_to_jobs(resume_text, jobs, top_k=5):
    resume_emb = semantic_model.encode(resume_text, convert_to_tensor=True)  # Encode resume
    parsed = parse_resume_fields_from_text(resume_text)
    resume_skills = parsed.get("skills", [])

    results = []
    for job in jobs:
        job_description = job.description if hasattr(job, "description") else job["description"]
        job_title = job.title if hasattr(job, "title") else job.get("title", "Untitled")
        job_id = job.id if hasattr(job, "id") else job.get("id", 0)

        job_emb = semantic_model.encode(job_description, convert_to_tensor=True)
        score = util.pytorch_cos_sim(resume_emb, job_emb).item()  # Cosine similarity
        matched = get_matched_skills(resume_skills, job_description)

        results.append({
            "job_id": job_id,
            "job_title": job_title,
            "match_score": round(score, 4),  # Keep original [0–1] scale
            "matched_skills": matched
        })

    return sorted(results, key=lambda x: x["match_score"], reverse=True)[:top_k]  # Return top K matches

# -------------------------------------------
# Fallback Support for TF-IDF Matching

# Attempts normal TF-IDF match, then falls back to curated dataset if no strong matches
def match_resume_with_fallback(resume_text, jobs, top_k=5):
    try:
        matches = match_resume_to_jobs(resume_text, jobs, top_k=top_k)
        # Check if matches are too weak
        if not matches or all(m["match_score"] < 0.05 for m in matches):
            print("No strong DB matches. Trying fallback with jobs_curated.csv...")
            try:
                fallback_jobs = load_jobs_from_csv("scripts/jobs_curated.csv")
                if not fallback_jobs:
                    print("[Fallback Matching Error] Fallback job list is empty.")
                    return []
                matches = match_resume_to_jobs(resume_text, fallback_jobs, top_k=top_k)
            except Exception as csv_err:
                print(f"[CSV Load Error] {csv_err}")
                return []
        return matches
    except Exception as e:
        print(f"[Fallback Matching Error] {e}")
        return []

# -------------------------------------------
# Matching Approach 3: Hybrid (Embeddings + Skills + Domain)

# Combines semantic similarity, skill overlap, and domain alignment into a weighted score
def hybrid_match_resume_to_jobs(resume_text, jobs, top_k=5):
    parsed = parse_resume_fields_from_text(resume_text)
    resume_skills = parsed.get("skills", [])
    resume_domains = parsed.get("domains", {})  # Dictionary of predicted/parsed domains

    resume_emb = semantic_model.encode(resume_text, convert_to_tensor=True)
    results = []

    for job in jobs:
        job_description = job.description if hasattr(job, "description") else job["description"]
        job_title = job.title if hasattr(job, "title") else job.get("title", "Untitled")
        job_id = job.id if hasattr(job, "id") else job.get("id", 0)
        job_domain = job.domain.lower() if hasattr(job, "domain") and job.domain else ""

        job_emb = semantic_model.encode(job_description, convert_to_tensor=True)
        embedding_score = util.pytorch_cos_sim(resume_emb, job_emb).item()  # Semantic similarity

        # Skill overlap: how many resume skills appear in the job description
        job_words = set(word_tokenize(job_description.lower()))
        matched_skills = [s for s in resume_skills if s.lower() in job_words]
        skill_overlap = len(matched_skills) / len(resume_skills) if resume_skills else 0

        # Domain match: binary 0 or 1 if domains match
        domain_score = 1 if job_domain in resume_domains else 0

        # Final weighted score: adjust weights as needed
        final_score = (
            0.65 * embedding_score +     # Semantic similarity
            0.25 * skill_overlap +       # Resume skill match
            0.10 * domain_score          # Domain alignment
        ) * 100  # Scaled to [0–100]

        results.append({
            "job_id": job_id,
            "job_title": job_title,
            "match_score": round(final_score, 4),
            "matched_skills": matched_skills
        })

    return sorted(results, key=lambda x: x["match_score"], reverse=True)[:top_k]


# Resume Enhancer (Rule-based Suggestions)

# Suggests missing domain-specific skills to add to resume
def suggest_resume_improvements(parsed_resume, domain_skills):
    resume_skills = parsed_resume.get("skills", [])
    suggestions = [skill for skill in domain_skills if skill not in resume_skills]
    return suggestions[:10]  # Limit to 10 suggestions





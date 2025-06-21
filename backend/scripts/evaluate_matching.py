import os
from app import create_app  # Adjust if you're not using a factory
from app.models import Job
from app.extensions import db
from app.ai_model import match_resume_to_jobs, semantic_match_resume_to_jobs
from app.resume_parser import extract_text_from_resume
from difflib import SequenceMatcher

# Ground truth mapping using job titles
ground_truth = {
    "resume_education.pdf": ["Teacher", "Curriculum Developer", "Instructional Designer"],
    "resume_artist.pdf": ["Graphic Designer", "Creative Director", "Visual Artist"],
    "resume_architecture.pdf": ["Architect", "Interior Designer", "Landscape Architect"],
    "resume_barista.pdf": ["Barista", "Cafe Assistant", "Hospitality Staff"],
    "resume_accounting.pdf": ["Accountant", "Financial Analyst", "Bookkeeper"],
    "resume_nursing.pdf": ["Registered Nurse", "Clinical Nurse", "Healthcare Assistant"],
    "resume_backend_developer.pdf": ["Backend Developer", "Software Engineer", "Web Developer"],
    "resume_programmer.pdf": ["Software Developer", "Programmer Analyst", "Application Developer"],
    "resume_business.pdf": ["Business Analyst", "Operations Manager", "Management Consultant"],
    "resume_Management Consultant.pdf": ["Management Consultant", "Business Advisor", "Strategy Analyst"],
    "resume_UIUX.pdf": ["UI/UX Designer", "Product Designer", "Front-End Developer"],
    "resume_engineering.pdf": ["Project Engineer", "Mechanical Engineer", "Resident Engineer"],
    "resume_hospitality.pdf": ["Hotel Receptionist", "Guest Services Agent", "Customer Service Rep"],
    "resume_doctor.pdf": ["Medical Doctor", "Physician", "Healthcare Specialist"],
    "resume_customer service.pdf": ["Customer Service Representative", "Client Support Specialist", "Customer Success Associate"],
    "resume_college_graduate.pdf": ["Trainee", "Graduate Analyst", "Entry-Level Associate"]
}


def is_similar(title1, title2, threshold=0.8):
    return SequenceMatcher(None, title1.lower(), title2.lower()).ratio() >= threshold

def precision_at_k(pred, gt, k=3):
    pred_k = pred[:k]
    return sum(1 for job in pred_k if any(is_similar(job, gt_job) for gt_job in gt)) / k

def recall_at_k(pred, gt, k=3):
    pred_k = pred[:k]
    return sum(1 for gt_job in gt if any(is_similar(gt_job, job) for job in pred_k)) / len(gt) if gt else 0

def mean_reciprocal_rank(predictions, ground_truth_list):
    mrr_total = 0.0
    for pred, gt in zip(predictions, ground_truth_list):
        for rank, job in enumerate(pred, 1):
            if any(is_similar(job, gt_job) for gt_job in gt):
                mrr_total += 1.0 / rank
                break
    return mrr_total / len(predictions)

metrics = {
    "hybrid": {"precision": [], "recall": [], "f1": [], "mrr": [], "avg_score": []},
    "embedding": {"precision": [], "recall": [], "f1": [], "mrr": [], "avg_score": []},
}

app = create_app()  # Or import your app directly if not using a factory

with app.app_context():
    db_jobs = Job.query.all()

    for resume_file, gt_titles in ground_truth.items():
        print(f"\nEvaluating: {resume_file}")
        resume_path = os.path.join("test_resumes", resume_file)
        resume_text = extract_text_from_resume(resume_path)

        hybrid_results = match_resume_to_jobs(resume_text, db_jobs)
        hybrid_top_titles = [job["job_title"] for job in hybrid_results[:3]]
        hybrid_scores = [job["match_score"] for job in hybrid_results[:3]]
        print(f"Hybrid Top Matches: {hybrid_top_titles}") 

        embed_results = semantic_match_resume_to_jobs(resume_text, db_jobs)
        embed_top_titles = [job["job_title"] for job in embed_results[:3]]
        embed_scores = [job["match_score"] for job in embed_results[:3]]
        print(f"Embedding Top Matches: {embed_top_titles}")

        # Hybrid evaluation
        if hybrid_scores:
            p = precision_at_k(hybrid_top_titles, gt_titles)
            r = recall_at_k(hybrid_top_titles, gt_titles)
            f1 = 2 * p * r / (p + r) if (p + r) else 0
            mrr = mean_reciprocal_rank([hybrid_top_titles], [gt_titles])
            avg_score = sum(hybrid_scores) / len(hybrid_scores)
            metrics["hybrid"]["precision"].append(p)
            metrics["hybrid"]["recall"].append(r)
            metrics["hybrid"]["f1"].append(f1)
            metrics["hybrid"]["mrr"].append(mrr)
            metrics["hybrid"]["avg_score"].append(avg_score)
        else:
            print(f"No hybrid matches for {resume_file}")

        # Embedding evaluation
        if embed_scores:
            p = precision_at_k(embed_top_titles, gt_titles)
            r = recall_at_k(embed_top_titles, gt_titles)
            f1 = 2 * p * r / (p + r) if (p + r) else 0
            mrr = mean_reciprocal_rank([embed_top_titles], [gt_titles])
            avg_score = sum(embed_scores) / len(embed_scores)
            metrics["embedding"]["precision"].append(p)
            metrics["embedding"]["recall"].append(r)
            metrics["embedding"]["f1"].append(f1)
            metrics["embedding"]["mrr"].append(mrr)
            metrics["embedding"]["avg_score"].append(avg_score)
        else:
            print(f"No embedding matches for {resume_file}")

    def print_metrics(name, result):
        print(f"\n{name} Results:")
        for k, v in result.items():
            print(f"{k.capitalize():<12}: {sum(v)/len(v):.4f}" if v else f"{k.capitalize():<12}: N/A")

    print_metrics("Hybrid", metrics["hybrid"])
    print_metrics("Embeddings", metrics["embedding"])

import os
from app import create_app
from app.models import Job
from app.extensions import db
from app.ai_model import match_resume_to_jobs, semantic_match_resume_to_jobs
from app.resume_parser import extract_text_from_resume ,parse_resume_fields
from sentence_transformers import SentenceTransformer, util
import nltk
nltk.download('punkt')


# Load semantic model for better job title comparison
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")

# Use top_k = 5 for fairer evaluation
TOP_K = 5

# Expanded ground truth titles for each resume
ground_truth = {
    
    "resume_education.pdf": [
        "Teacher",
        "Curriculum Developer",
        "Instructional Designer",
        "Academic Coordinator",
        "Education Consultant",
        "Learning Designer",
        "Instructional Coach",
        "Academic Advisor",
        "Education Program Manager"
    ],
    "resume_artist.pdf": [
        "Graphic Designer",
        "Creative Director",
        "Visual Artist",
        "Art Director",
        "Illustrator",
        "Multimedia Designer",
        "Art Producer",
        "Digital Illustrator",
        "Visual Effects Artist"
    ],
    "resume_architecture.pdf": [
        "Architect",
        "Interior Designer",
        "Landscape Architect",
        "Design Architect",
        "Urban Planner",
        "Building Designer",
        "Urban Designer",
        "Architectural Technologist",
        "Planning Consultant"
    ],
    "resume_barista.pdf": [
        "Barista",
        "Cafe Assistant",
        "Hospitality Staff",
        "Coffee Specialist",
        "Food Service Worker",
        "Counter Staff",
        "Beverage Specialist",
        "Coffee Bar Attendant",
        "Food and Beverage Assistant"
    ],
    "resume_accounting.pdf": [
        "Accountant",
        "Financial Analyst",
        "Bookkeeper",
        "Tax Associate",
        "Auditor",
        "Accounts Payable Clerk",
        "Audit Associate",
        "Cost Accountant",
        "Financial Auditor"
    ],
    "resume_nursing.pdf": [
        "Registered Nurse",
        "Clinical Nurse",
        "Healthcare Assistant",
        "Staff Nurse",
        "Licensed Practical Nurse",
        "Medical-Surgical Nurse",
        "Nurse Practitioner",
        "Emergency Room Nurse",
        "Pediatric Nurse"
    ],
    "resume_backend_developer.pdf": [
        "Backend Developer",
        "Software Engineer",
        "Web Developer",
        "API Developer",
        "Server-side Developer",
        "Python Developer",
        "Node.js Developer",
        "Java Developer",
        "Backend Software Engineer"
    ],
    "resume_programmer.pdf": [
        "Software Developer",
        "Programmer Analyst",
        "Application Developer",
        "Full Stack Developer",
        "Backend Engineer",
        "DevOps Engineer",
        "Mobile App Developer",
        "Technical Programmer",
        "Cloud Developer"
    ],
    "resume_business.pdf": [
        "Business Analyst",
        "Operations Manager",
        "Management Consultant",
        "Strategy Analyst",
        "Project Coordinator",
        "Process Improvement Analyst",
        "Business Operations Analyst",
        "Strategy Consultant",
        "Organizational Analyst"
    ],
    "resume_Management Consultant.pdf": [
        "Management Consultant",
        "Business Advisor",
        "Strategy Analyst",
        "Business Transformation Consultant",
        "Change Management Specialist",
        "Organizational Consultant",
        "Corporate Strategy Consultant",
        "Enterprise Transformation Advisor",
        "Business Optimization Consultant"
    ],
    "resume_UIUX.pdf": [
        "UI/UX Designer",
        "Product Designer",
        "Front-End Developer",
        "Interaction Designer",
        "User Interface Designer",
        "UX Researcher",
        "UX Architect",
        "UI Engineer",
        "Interaction Architect"
    ],
    "resume_engineering.pdf": [
        "Project Engineer",
        "Mechanical Engineer",
        "Resident Engineer",
        "Field Engineer",
        "Design Engineer",
        "Site Engineer",
        "Structural Engineer",
        "Project Manager - Engineering",
        "Construction Engineer"
    ],
    "resume_hospitality.pdf": [
        "Hotel Receptionist",
        "Guest Services Agent",
        "Customer Service Rep",
        "Front Desk Clerk",
        "Concierge",
        "Hospitality Associate",
        "Lodging Associate",
        "Resort Concierge",
        "Guest Experience Specialist"
    ],
    "resume_doctor.pdf": [
        "Medical Doctor",
        "Physician",
        "Healthcare Specialist",
        "General Practitioner",
        "Family Medicine Doctor",
        "Clinical Physician",
        "Internal Medicine Physician",
        "Clinical Specialist",
        "Emergency Medicine Doctor"
    ],
    "resume_customer service.pdf": [
        "Customer Service Representative",
        "Client Support Specialist",
        "Customer Success Associate",
        "Help Desk Agent",
        "Support Specialist",
        "Service Advisor",
        "Customer Experience Specialist",
        "Service Desk Representative",
        "Call Center Agent"
    ],
    "resume_college_graduate.pdf": [
        "Trainee",
        "Graduate Analyst",
        "Entry-Level Associate",
        "Junior Analyst",
        "Intern",
        "Assistant Coordinator",
        "Junior Coordinator",
        "Assistant Analyst",
        "New Graduate Associate"
    ],
    "resume_data_science.pdf": [
        "Data Science",
        "Data Science Specialist",
        "Data Science Expert"
    ],
    "resume_marketing.pdf": [
        "Marketing",
        "Marketing Specialist",
        "Marketing Expert"
    ],
    "resume_cybersecurity.pdf": [
        "Cybersecurity",
        "Cybersecurity Specialist",
        "Cybersecurity Expert"
    ],
    "resume_finance.pdf": [
        "Finance",
        "Finance Specialist",
        "Finance Expert"
    ],
    "resume_sales.pdf": [
        "Sales",
        "Sales Specialist",
        "Sales Expert"
    ],
    "resume_teaching.pdf": [
        "Teaching",
        "Teaching Specialist",
        "Teaching Expert"
    ],
    "resume_graphic_design.pdf": [
        "Graphic Design",
        "Graphic Design Specialist",
        "Graphic Design Expert"
    ],
    "resume_civil_engineering.pdf": [
        "Civil Engineering",
        "Civil Engineering Specialist",
        "Civil Engineering Expert"
    ],
    "resume_legal.pdf": [
        "Legal",
        "Legal Specialist",
        "Legal Expert"
    ],
    "resume_software_engineering.pdf": [
        "Software Engineering",
        "Software Engineering Specialist",
        "Software Engineering Expert"
    ],
    "resume_frontend.pdf": [
        "Frontend",
        "Frontend Specialist",
        "Frontend Expert"
    ],
    "resume_backend.pdf": [
        "Backend",
        "Backend Specialist",
        "Backend Expert"
    ],
    "resume_mobile_dev.pdf": [
        "Mobile Dev",
        "Mobile Dev Specialist",
        "Mobile Dev Expert"
    ],
    "resume_ai_research.pdf": [
        "Ai Research",
        "Ai Research Specialist",
        "Ai Research Expert"
    ],
    "resume_mechanical.pdf": [
        "Mechanical",
        "Mechanical Specialist",
        "Mechanical Expert"
    ],
    "resume_interior_design.pdf": [
        "Interior Design",
        "Interior Design Specialist",
        "Interior Design Expert"
    ],
    "resume_hr.pdf": [
        "Hr",
        "Hr Specialist",
        "Hr Expert"
    ],
    "resume_admin.pdf": [
        "Admin",
        "Admin Specialist",
        "Admin Expert"
    ],
    "resume_qa_testing.pdf": [
        "Qa Testing",
        "Qa Testing Specialist",
        "Qa Testing Expert"
    ],
    "resume_logistics.pdf": [
        "Logistics",
        "Logistics Specialist",
        "Logistics Expert"
    ],
    "resume_customer_support.pdf": [
        "Customer Support",
        "Customer Support Specialist",
        "Customer Support Expert"
    ],
    "resume_uiux.pdf": [
        "Uiux",
        "Uiux Specialist",
        "Uiux Expert"
    ],
    "resume_copywriting.pdf": [
        "Copywriting",
        "Copywriting Specialist",
        "Copywriting Expert"
    ],
    "resume_project_management.pdf": [
        "Project Management",
        "Project Management Specialist",
        "Project Management Expert"
    ]
}
    



def is_semantically_similar(title1, title2, threshold=0.75):
    emb1 = semantic_model.encode(title1, convert_to_tensor=True)
    emb2 = semantic_model.encode(title2, convert_to_tensor=True)
    sim = util.pytorch_cos_sim(emb1, emb2).item()
    return sim >= threshold

def precision_at_k(pred, gt, k=TOP_K):
    pred_k = pred[:k]
    return sum(1 for job in pred_k if any(is_semantically_similar(job, gt_job) for gt_job in gt)) / k

def recall_at_k(pred, gt, k=TOP_K):
    pred_k = pred[:k]
    return sum(1 for gt_job in gt if any(is_semantically_similar(gt_job, job) for job in pred_k)) / len(gt) if gt else 0

def mean_reciprocal_rank(predictions, ground_truth_list):
    mrr_total = 0.0
    for pred, gt in zip(predictions, ground_truth_list):
        for rank, job in enumerate(pred, 1):
            if any(is_semantically_similar(job, gt_job) for gt_job in gt):
                mrr_total += 1.0 / rank
                break
    return mrr_total / len(predictions)

metrics = {
    "hybrid": {"precision": [], "recall": [], "f1": [], "mrr": [], "avg_score": []},
    "embedding": {"precision": [], "recall": [], "f1": [], "mrr": [], "avg_score": []},
}

app = create_app()

with app.app_context():
    db_jobs = Job.query.all()

    for resume_file, gt_titles in ground_truth.items():
        print(f"\nEvaluating: {resume_file}")
        resume_path = os.path.join("test_resumes", resume_file)
        parsed = parse_resume_fields(resume_path)
        resume_text = parsed["raw_text"]  # Still needed for TF-IDF & embeddings

        hybrid_results = match_resume_to_jobs(resume_text, db_jobs)
        hybrid_top_titles = [job["job_title"] for job in hybrid_results[:TOP_K]]
        hybrid_scores = [job["match_score"] for job in hybrid_results[:TOP_K]]
        print(f"Hybrid Top Matches: {hybrid_top_titles}")

        embed_results = semantic_match_resume_to_jobs(resume_text, db_jobs)
        embed_top_titles = [job["job_title"] for job in embed_results[:TOP_K]]
        embed_scores = [job["match_score"] for job in embed_results[:TOP_K]]
        print(f"Embedding Top Matches: {embed_top_titles}")

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

    def print_metrics(name, result):
        print(f"\n{name} Results:")
        for k, v in result.items():
            print(f"{k.capitalize():<12}: {sum(v)/len(v):.4f}" if v else f"{k.capitalize():<12}: N/A")

    print_metrics("Hybrid", metrics["hybrid"])
    print_metrics("Embeddings", metrics["embedding"])
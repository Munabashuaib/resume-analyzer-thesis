import os
import random
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score
from app.resume_parser import extract_text_from_resume
from app.ai_model import match_resume_to_jobs, semantic_match_resume_to_jobs
from app import create_app
from app.models import Job
from app.extensions import db

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
    


NUM_RUNS = 10
TEST_RATIO = 0.2
SEEDS = list(range(1, NUM_RUNS + 1))
TOP_N = 5  # Increased for better evaluation
RESUME_FOLDER = "test_resumes"

hybrid_metrics = []
embedding_metrics = []

app = create_app()
with app.app_context():
    db_jobs = Job.query.all()

    for seed in SEEDS:
        random.seed(seed)
        resumes = list(ground_truth.keys())
        random.shuffle(resumes)
        test_size = int(len(resumes) * TEST_RATIO)
        test_set = resumes[:test_size]

        for mode in ['hybrid', 'embeddings']:
            y_true = []
            y_pred = []
            reciprocal_ranks = []

            for resume_name in test_set:
                resume_path = os.path.join(RESUME_FOLDER, resume_name)
                gt_titles = ground_truth[resume_name]
                print(f"[{mode.upper()}][Seed {seed}] Evaluating {resume_name}...")
                resume_text = extract_text_from_resume(resume_path)

                results = match_resume_to_jobs(resume_text, db_jobs) if mode == 'hybrid' else semantic_match_resume_to_jobs(resume_text, db_jobs)

                # Filter duplicates by title
                seen_titles = set()
                filtered_results = []
                for job in results:
                    if job['job_title'] not in seen_titles:
                        seen_titles.add(job['job_title'])
                        filtered_results.append(job)

                top_titles = [job['job_title'] for job in filtered_results[:TOP_N]]

                # Smart title match logic
                gt_normalized = [gt.lower().replace("&", "and").strip() for gt in gt_titles]

                match_found = False
                for rank, title in enumerate(top_titles):
                    normalized_title = title.lower().replace("&", "and").strip()
                    if any(normalized_title in gt or gt in normalized_title for gt in gt_normalized):
                        y_true.append(1)
                        y_pred.append(1)
                        reciprocal_ranks.append(1 / (rank + 1))
                        match_found = True
                        break

                if not match_found:
                    y_true.append(1)
                    y_pred.append(0)
                    reciprocal_ranks.append(0)

            precision = precision_score(y_true, y_pred, zero_division=0)
            recall = recall_score(y_true, y_pred, zero_division=0)
            f1 = f1_score(y_true, y_pred, zero_division=0)
            mrr = np.mean(reciprocal_ranks)

            if mode == 'hybrid':
                hybrid_metrics.append([precision, recall, f1, mrr])
            else:
                embedding_metrics.append([precision, recall, f1, mrr])

def summarize(name, metrics_list):
    arr = np.array(metrics_list)
    means = np.mean(arr, axis=0)
    stds = np.std(arr, axis=0)
    print(f"\n{name} Results over {NUM_RUNS} runs (with 80/20 splits):")
    print(f"Precision: {means[0]:.4f} ± {stds[0]:.4f}")
    print(f"Recall   : {means[1]:.4f} ± {stds[1]:.4f}")
    print(f"F1 Score : {means[2]:.4f} ± {stds[2]:.4f}")
    print(f"MRR      : {means[3]:.4f} ± {stds[3]:.4f}")

summarize("Hybrid", hybrid_metrics)
summarize("Embeddings", embedding_metrics)

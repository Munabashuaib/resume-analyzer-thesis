# === Imports for NLP, file handling, and preprocessing ===
import os
import re
import json
import nltk
import spacy
import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from PyPDF2 import PdfReader
from collections import defaultdict
from spacy.matcher import PhraseMatcher
from docx import Document  # For parsing DOCX resumes

# Download required NLTK datasets ===
nltk.download('punkt')                     # Tokenizer
nltk.download('punkt_tab')                 # Tokenizer patch for some environments
nltk.download('stopwords')                 # Common English stopwords
nltk.download('averaged_perceptron_tagger')  # (optional) For POS tagging

# Initialize NLP models and stop words ===
nlp = spacy.load("en_core_web_sm")
stop_words = set(stopwords.words('english'))

# -----------------------------------------------
# Dataset Loaders: Load skills and skill-domain mappings

# Safely load a CSV file (supports both 'skill' or 'skills' column)
def safe_load_csv(path):
    try:
        df = pd.read_csv(path)
        if 'skill' in df.columns:
            return [s.strip().lower() for s in df['skill'].dropna().unique()]
        elif 'skills' in df.columns:
            return [s.strip().lower() for s in df['skills'].dropna().unique()]
    except Exception as e:
        print(f"Failed to load {path}: {e}")
    return []

# Safely load a JSON file (returns empty dict if missing or invalid)
def safe_load_json(path):
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load {path}: {e}")
    return {}

# Load main skill list and domain mapping from datasets
skills_csv = safe_load_csv("datasets/Updated_Universal_Skills.csv")
skill_domains = safe_load_json("datasets/skill_domains_extended.json")

# -----------------------------------------------
# Resume Text Extraction (Supports PDF and DOCX)

def extract_text_from_resume(path):
    ext = os.path.splitext(path)[1].lower()
    text = ""

    if ext == ".pdf":
        with open(path, "rb") as f:
            pdf = PdfReader(f)
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    elif ext == ".docx":
        doc = Document(path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        raise ValueError("Unsupported file format. Please upload a PDF or DOCX resume.")

    return text.strip()

# -----------------------------------------------
# Skill Extraction & Cleanup

# Extract skills from raw text using spaCy PhraseMatcher and loaded skill list
def extract_skills(text):
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(skill) for skill in skills_csv]
    matcher.add("SKILLS", patterns)
    doc = nlp(text)
    matches = matcher(doc)
    return list(set([doc[start:end].text.lower() for match_id, start, end in matches]))

# Clean up extracted skills: remove stopwords, punctuation, etc.
def clean_and_filter_skills(skill_list):
    cleaned = []
    for skill in skill_list:
        tokens = word_tokenize(skill.lower())
        tokens = [t for t in tokens if t not in stop_words and t.isalpha()]
        if tokens:
            cleaned.append(" ".join(tokens))
    return list(set(cleaned))

# Map skills to domains using skill_domains.json
def map_skills_to_domains(skills):
    domain_counter = defaultdict(int)
    for skill in skills:
        domain = skill_domains.get(skill.lower())
        if domain:
            domain_counter[domain] += 1
    return dict(domain_counter)

# -----------------------------------------------
# Extract Education Section (heuristic-based)

# Extract lines mentioning degrees, universities, etc.
def extract_education(text):
    education = []
    lines = text.split("\n")
    for line in lines:
        if any(keyword in line.lower() for keyword in ["bachelor", "master", "phd", "degree", "university", "college"]):
            education.append(line.strip())
    return education

# -----------------------------------------------
# Extract Experience Duration (heuristic + regex)

# Estimate number of years of experience by scanning lines and date patterns
def extract_experience(text):
    exp_years = 0
    exp_lines = [line for line in text.split('\n') if any(kw in line.lower() for kw in ['experience', 'worked', 'developer', 'engineer'])]

    # Common patterns for dates (e.g., "2018-2021", "Jan 2020 - Present")
    date_patterns = [
        r"(\d{4})\s*[-–]\s*(\d{4}|present)",
        r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[-–]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4}|present)"
    ]

    for line in exp_lines:
        for pattern in date_patterns:
            for match in re.findall(pattern, line, re.IGNORECASE):
                try:
                    start = int(match[0][-4:])  # Handle "Jan 2020" or "2020"
                    end = int(match[1][-4:]) if 'present' not in match[1].lower() else 2024
                    if end >= start:
                        exp_years += end - start
                except:
                    continue
    return exp_years

# -----------------------------------------------
# Main Resume Parsing Function (from uploaded file)

def parse_resume_fields(path):
    raw_text = extract_text_from_resume(path)
    raw_skills = extract_skills(raw_text)
    cleaned_skills = clean_and_filter_skills(raw_skills)
    domain_scores = map_skills_to_domains(cleaned_skills)
    education = extract_education(raw_text)
    experience = extract_experience(raw_text)
    return {
        "skills": cleaned_skills,
        "domains": domain_scores,
        "education": education,
        "experience_years": experience,
        "raw_text": raw_text
    }

# -----------------------------------------------
# Alternate Parsing Function (from raw string)
# Used when resume is uploaded as text


def parse_resume_fields_from_text(text):
    raw_skills = extract_skills(text)
    cleaned_skills = clean_and_filter_skills(raw_skills)
    domain_scores = map_skills_to_domains(cleaned_skills)
    education = extract_education(text)
    experience = extract_experience(text)
    return {
        "skills": cleaned_skills,
        "domains": domain_scores,
        "education": education,
        "experience_years": experience,
        "raw_text": text
    }

# -----------------------------------------------
# Keyword Extractor (used by enhancer or matching logic)

def extract_keywords_from_text(text):
    tokens = nltk.word_tokenize(text)
    tokens = [t.lower() for t in tokens if t.isalpha()]
    return [t for t in tokens if t not in stopwords.words("english")]

 





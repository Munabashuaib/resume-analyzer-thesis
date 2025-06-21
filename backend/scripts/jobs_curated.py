import pandas as pd

# Load the full LinkedIn job postings
df = pd.read_csv("datasets/postings.csv")

# Drop rows with missing required fields
df = df[['title', 'company_name', 'description']].dropna()
df.rename(columns={
    'title': 'title',
    'company_name': 'company',
    'job_description': 'description'
}, inplace=True)

# Step 1: Auto-tag domains based on keywords in job title/description
def tag_domain(text):
    text = text.lower()
    if any(k in text for k in ['nurse', 'medical', 'hospital', 'clinical']):
        return 'healthcare'
    elif any(k in text for k in ['architect', 'urban planner']):
        return 'architecture'
    elif any(k in text for k in ['teacher', 'educator', 'professor']):
        return 'education'
    elif any(k in text for k in ['designer', 'ux', 'ui', 'graphic']):
        return 'design'
    elif any(k in text for k in ['marketing', 'sales', 'consultant', 'business', 'management']):
        return 'business'
    elif any(k in text for k in ['finance', 'accountant', 'financial']):
        return 'finance'
    elif any(k in text for k in ['admin', 'office', 'receptionist']):
        return 'administration'
    elif any(k in text for k in ['software', 'developer', 'data scientist', 'engineer', 'programmer']):
        return 'technology'
    elif any(k in text for k in ['lawyer', 'paralegal', 'legal']):
        return 'legal'
    elif any(k in text for k in ['mechanic', 'technician', 'maintenance']):
        return 'mechanical'
    elif any(k in text for k in ['chef', 'barista', 'waiter', 'hospitality', 'hotel']):
        return 'hospitality'
    elif any(k in text for k in ['artist', 'musician', 'painter', 'illustrator', 'creative']):
        return 'arts'
    elif any(k in text for k in ['customer service', 'call center', 'support agent', 'helpdesk']):
        return 'customer_service'
    else:
        return 'other'


df['domain'] = df['title'].apply(tag_domain)

# Step 2: Sample up to 50 jobs per domain
grouped = df.groupby('domain')
df_curated = grouped.apply(lambda x: x.sample(n=min(len(x), 50), random_state=42)).reset_index(drop=True)

# Step 3: Save to CSV
df_curated.to_csv("jobs_curated.csv", index=False)
print("jobs_curated.csv generated with", df_curated['domain'].nunique(), "domains and", len(df_curated), "jobs.")

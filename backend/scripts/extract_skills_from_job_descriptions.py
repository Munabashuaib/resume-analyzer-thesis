import pandas as pd
import re
from collections import Counter
import spacy

nlp = spacy.load("en_core_web_sm")

# Load job descriptions from your onet_raw.csv
df = pd.read_csv("datasets/onet_raw.csv")
descriptions = df['Description'].dropna().tolist()

# Merge all job descriptions into one string
text = " ".join(descriptions)

# Run through spaCy to extract noun-based tokens
doc = nlp(text)
tokens = [
    token.text.lower() for token in doc
    if token.pos_ in ['NOUN', 'PROPN']
    and not token.is_stop
    and token.is_alpha
    and len(token.text) > 2
]

# Frequency analysis
token_freq = Counter(tokens)
top_skills = [skill for skill, freq in token_freq.most_common(300)]

# Save skills list
skills_df = pd.DataFrame({'skills': sorted(set(top_skills))})
skills_df.to_csv("datasets/enhanced_skills_extended.csv", index=False)

print(f"Extracted and saved {len(skills_df)} potential skills to datasets/enhanced_skills_extended.csv")

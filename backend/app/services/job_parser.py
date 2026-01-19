import re
from typing import Dict, List, Optional
import spacy


class JobParser:
    """Parse job descriptions and extract structured information"""
    
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Warning: spaCy model not loaded")
            self.nlp = None
        
        # Common skill keywords
        self.skill_keywords = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'dynamodb', 'cassandra', 'oracle'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible'],
            'ml_ai': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision'],
            'tools': ['git', 'jenkins', 'jira', 'linux', 'bash', 'agile', 'scrum'],
        }
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract required skills from job description"""
        text_lower = text.lower()
        found_skills = []
        
        for category, skills in self.skill_keywords.items():
            for skill in skills:
                if skill.lower() in text_lower:
                    found_skills.append(skill)
        
        return list(set(found_skills))
    
    def extract_experience_years(self, text: str) -> tuple[Optional[int], Optional[int]]:
        """Extract minimum and maximum years of experience"""
        # Patterns like "3-5 years", "5+ years", "minimum 3 years"
        patterns = [
            r'(\d+)\s*-\s*(\d+)\s*years?',  # 3-5 years
            r'(\d+)\s*to\s*(\d+)\s*years?',  # 3 to 5 years
            r'(\d+)\+\s*years?',  # 5+ years
            r'minimum\s*(\d+)\s*years?',  # minimum 3 years
            r'at\s*least\s*(\d+)\s*years?',  # at least 3 years
        ]
        
        text_lower = text.lower()
        
        # Check for ranges first
        for pattern in patterns[:2]:
            matches = re.findall(pattern, text_lower)
            if matches:
                min_years, max_years = int(matches[0][0]), int(matches[0][1])
                return min_years, max_years
        
        # Check for minimum/at least
        for pattern in patterns[3:]:
            matches = re.findall(pattern, text_lower)
            if matches:
                min_years = int(matches[0])
                return min_years, None
        
        # Check for X+ years
        matches = re.findall(patterns[2], text_lower)
        if matches:
            min_years = int(matches[0])
            return min_years, None
        
        return None, None
    
    def parse(self, title: str, description: str, requirements: Optional[str] = None) -> Dict:
        """Parse job posting and extract structured data"""
        
        # Combine all text for analysis
        full_text = f"{title}\n{description}"
        if requirements:
            full_text += f"\n{requirements}"
        
        # Extract structured information
        skills = self.extract_skills(full_text)
        min_exp, max_exp = self.extract_experience_years(full_text)
        
        result = {
            'required_skills': skills,
            'experience_years_min': min_exp,
            'experience_years_max': max_exp,
        }
        
        return result

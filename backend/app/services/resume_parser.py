import re
from pathlib import Path
from typing import Dict, List, Optional
import PyPDF2
import docx
import spacy
from datetime import datetime


class ResumeParser:
    """Parse resumes and extract structured information"""
    
    def __init__(self):
        # Load spaCy model for NLP
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
        
        # Common skill keywords
        self.skill_keywords = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'dynamodb', 'cassandra', 'oracle'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible'],
            'ml_ai': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision'],
            'tools': ['git', 'jenkins', 'jira', 'linux', 'bash', 'agile', 'scrum'],
        }
    
    def extract_text_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_path: Path) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")
    
    def extract_text(self, file_path: Path) -> str:
        """Extract text based on file extension"""
        suffix = file_path.suffix.lower()
        
        if suffix == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif suffix == '.docx':
            return self.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {suffix}")
    
    def extract_email(self, text: str) -> Optional[str]:
        """Extract email address from text"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        return emails[0] if emails else None
    
    def extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number from text"""
        # Match various phone formats
        phone_patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            if phones:
                return phones[0]
        return None
    
    def extract_name(self, text: str) -> Optional[str]:
        """Extract candidate name (first line or using NER)"""
        # Simple approach: first line that looks like a name
        lines = text.strip().split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and len(line.split()) <= 4 and len(line) < 50:
                # Likely a name
                return line
        
        # Fallback: use spaCy NER
        doc = self.nlp(text[:500])  # First 500 chars
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text
        
        return None
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        text_lower = text.lower()
        found_skills = []
        
        for category, skills in self.skill_keywords.items():
            for skill in skills:
                if skill.lower() in text_lower:
                    found_skills.append(skill)
        
        return list(set(found_skills))  # Remove duplicates
    
    def calculate_experience_years(self, text: str) -> Optional[float]:
        """Estimate years of experience from text"""
        # Look for patterns like "5 years", "5+ years", etc.
        experience_patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'experience[:\s]+(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s+in',
        ]
        
        years = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text.lower())
            years.extend([int(m) for m in matches])
        
        if years:
            return float(max(years))  # Return highest mentioned
        
        # Fallback: count year ranges (e.g., "2018-2020")
        year_pattern = r'(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}'
        year_ranges = re.findall(year_pattern, text)
        
        if year_ranges:
            # Rough estimate based on number of job entries
            return len(year_ranges) * 2.0  # Assume 2 years per job
        
        return None
    
    def extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information"""
        education = []
        
        # Common degree keywords
        degree_keywords = ['bachelor', 'master', 'phd', 'doctorate', 'mba', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 'diploma']
        
        lines = text.lower().split('\n')
        for i, line in enumerate(lines):
            for keyword in degree_keywords:
                if keyword in line:
                    education.append({
                        'degree': line.strip(),
                        'details': lines[i+1].strip() if i+1 < len(lines) else ''
                    })
                    break
        
        return education[:5]  # Limit to 5 entries
    
    def parse(self, file_path: Path) -> Dict:
        """Parse resume and return structured data"""
        # Extract raw text
        raw_text = self.extract_text(file_path)
        
        # Extract structured information
        result = {
            'raw_text': raw_text,
            'candidate_name': self.extract_name(raw_text),
            'candidate_email': self.extract_email(raw_text),
            'candidate_phone': self.extract_phone(raw_text),
            'skills': self.extract_skills(raw_text),
            'experience_years': self.calculate_experience_years(raw_text),
            'education': self.extract_education(raw_text),
        }
        
        return result

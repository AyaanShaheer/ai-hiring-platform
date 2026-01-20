import re
from typing import Dict, List, Optional
from app.services.genai_service import GenAIService
import json


class BiasDetectionService:
    """Detect potential bias in hiring decisions and job descriptions"""
    
    def __init__(self):
        # Protected characteristics (should not influence decisions)
        self.protected_patterns = {
            'age': r'\b(age|years old|young|senior|elderly|generation|millennial|boomer)\b',
            'gender': r'\b(he|she|him|her|male|female|man|woman|guy|girl)\b',
            'ethnicity': r'\b(race|ethnicity|nationality|culture|accent)\b',
            'religion': r'\b(religion|religious|christian|muslim|hindu|jewish|atheist)\b',
            'disability': r'\b(disability|disabled|handicapped|impaired)\b',
            'marital_status': r'\b(married|single|divorced|spouse|family status)\b',
            'pregnancy': r'\b(pregnant|pregnancy|maternity|paternity)\b',
        }
        
        # Biased language in job descriptions
        self.biased_job_language = {
            'masculine': ['aggressive', 'dominant', 'competitive', 'rock star', 'ninja', 'guru'],
            'feminine': ['nurturing', 'supportive', 'collaborative'],
            'age_biased': ['digital native', 'recent graduate', 'young and energetic', 'seasoned professional'],
            'cultural': ['culture fit', 'native speaker', 'local candidate'],
        }
    
    def check_protected_characteristics(self, text: str) -> Dict:
        """Check for mentions of protected characteristics"""
        
        if not text:
            return {"flags": [], "score": 0}
        
        text_lower = text.lower()
        flags = []
        
        for category, pattern in self.protected_patterns.items():
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                unique_matches = list(set(matches))
                flags.append({
                    "category": category,
                    "matches": unique_matches,
                    "severity": "high",
                    "message": f"References to {category}: {', '.join(unique_matches[:3])}"
                })
        
        bias_score = min(len(flags) * 20, 100)
        
        return {
            "flags": flags,
            "score": bias_score
        }
    
    def check_job_description_bias(self, job_description: str, job_requirements: str) -> Dict:
        """Check job postings for biased language"""
        
        full_text = f"{job_description} {job_requirements}".lower()
        bias_flags = []
        
        for bias_type, keywords in self.biased_job_language.items():
            found = [word for word in keywords if word in full_text]
            if found:
                bias_flags.append({
                    "type": bias_type,
                    "keywords": found,
                    "severity": "medium",
                    "message": f"{bias_type.replace('_', ' ').title()} language detected: {', '.join(found)}"
                })
        
        return {
            "flags": bias_flags,
            "has_bias": len(bias_flags) > 0,
            "bias_count": len(bias_flags)
        }
    
    def analyze_scoring_bias(
        self,
        match_scores: List[Dict],
        candidate_demographics: Optional[Dict] = None
    ) -> Dict:
        """Analyze if scoring shows bias patterns"""
        
        # This is a simplified analysis
        # In production, you'd use statistical methods to detect disparate impact
        
        if len(match_scores) < 5:
            return {
                "has_bias": False,
                "message": "Insufficient data for bias analysis",
                "recommendation": "Collect more data points"
            }
        
        # Calculate score variance
        scores = [s['match_score'] for s in match_scores if 'match_score' in s]
        if not scores:
            return {"has_bias": False, "message": "No scores to analyze"}
        
        avg_score = sum(scores) / len(scores)
        variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
        
        # High variance might indicate inconsistent (potentially biased) scoring
        if variance > 500:  # Arbitrary threshold
            return {
                "has_bias": True,
                "message": "High score variance detected - review for consistent criteria",
                "recommendation": "Ensure all candidates are evaluated using the same criteria",
                "variance": round(variance, 2),
                "avg_score": round(avg_score, 2)
            }
        
        return {
            "has_bias": False,
            "message": "No obvious bias patterns detected",
            "variance": round(variance, 2),
            "avg_score": round(avg_score, 2)
        }
    
    async def generate_ai_bias_report(
        self,
        job_title: str,
        job_description: str,
        candidates_summary: str,
        detected_flags: List[Dict]
    ) -> Dict:
        """Use AI to analyze potential bias in hiring process"""
        
        provider = GenAIService.get_provider()
        
        prompt = f"""Analyze this hiring scenario for potential bias and discrimination concerns.

**Job Position:**
Title: {job_title}
Description: {job_description[:500]}

**Candidate Evaluation Context:**
{candidates_summary}

**Detected Bias Flags:**
{json.dumps(detected_flags, indent=2) if detected_flags else 'None detected by rules'}

Provide a comprehensive bias analysis in JSON format:
{{
    "bias_risk_level": "low/medium/high",
    "potential_biases": ["bias 1", "bias 2", "bias 3"],
    "discriminatory_language": ["example 1", "example 2"],
    "fairness_score": 0-100,
    "recommendations": [
        "recommendation 1",
        "recommendation 2",
        "recommendation 3"
    ],
    "best_practices": [
        "practice 1",
        "practice 2",
        "practice 3"
    ],
    "legal_considerations": ["consideration 1", "consideration 2"],
    "summary": "2-3 sentence summary of bias assessment"
}}

Focus on:
1. Equal opportunity employment compliance
2. Protected characteristics under employment law
3. Unconscious bias in job descriptions
4. Fair evaluation criteria
5. Inclusive language recommendations

Respond ONLY with valid JSON.
"""
        
        try:
            response_text = await provider.generate_explanation(prompt)
            
            # Clean and parse JSON
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            parsed = json.loads(response_text)
            
            return {
                "bias_risk_level": parsed.get("bias_risk_level", "medium"),
                "potential_biases": parsed.get("potential_biases", []),
                "discriminatory_language": parsed.get("discriminatory_language", []),
                "fairness_score": parsed.get("fairness_score", 50),
                "recommendations": parsed.get("recommendations", []),
                "best_practices": parsed.get("best_practices", []),
                "legal_considerations": parsed.get("legal_considerations", []),
                "summary": parsed.get("summary", ""),
                "raw_response": response_text
            }
        except Exception as e:
            return {
                "bias_risk_level": "unknown",
                "potential_biases": ["Unable to complete AI analysis"],
                "discriminatory_language": [],
                "fairness_score": 0,
                "recommendations": ["Manual review recommended"],
                "best_practices": [],
                "legal_considerations": [],
                "summary": f"AI analysis failed: {str(e)}",
                "raw_response": str(e)
            }

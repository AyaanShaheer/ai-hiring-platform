import re
from typing import Dict, List, Optional, Tuple
from app.services.genai_service import GenAIService
import json


class FraudDetectionService:
    """Detect resume fraud and inflation using AI and rule-based checks"""
    
    def __init__(self):
        self.suspicious_patterns = {
            'excessive_keywords': r'\b(expert|guru|ninja|rockstar|10x|world-class)\b',
            'too_many_skills': 50,  # More than 50 skills is suspicious
            'unrealistic_experience': 30,  # More than 30 years is suspicious
            'buzzword_spam': ['synergy', 'paradigm shift', 'disruptive', 'revolutionary'],
        }
    
    def check_skill_inflation(self, skills: List[str], experience_years: float) -> Dict:
        """Check if number of skills is realistic for experience level"""
        
        if not skills or experience_years is None:
            return {"flag": False, "reason": ""}
        
        # Expected skills per year of experience
        expected_skills_per_year = 5
        max_expected_skills = experience_years * expected_skills_per_year
        
        if len(skills) > max_expected_skills + 10:
            return {
                "flag": True,
                "reason": f"Too many skills ({len(skills)}) for {experience_years} years of experience",
                "severity": "high"
            }
        
        return {"flag": False, "reason": ""}
    
    def check_buzzword_spam(self, text: str) -> Dict:
        """Check for excessive use of buzzwords"""
        
        if not text:
            return {"flag": False, "reason": ""}
        
        text_lower = text.lower()
        buzzword_count = 0
        found_buzzwords = []
        
        for buzzword in self.suspicious_patterns['buzzword_spam']:
            count = text_lower.count(buzzword)
            buzzword_count += count
            if count > 0:
                found_buzzwords.append(buzzword)
        
        if buzzword_count > 5:
            return {
                "flag": True,
                "reason": f"Excessive buzzwords: {', '.join(found_buzzwords)}",
                "severity": "medium"
            }
        
        return {"flag": False, "reason": ""}
    
    def check_title_inflation(self, text: str, experience_years: float) -> Dict:
        """Check for inflated job titles vs experience"""
        
        if not text or experience_years is None:
            return {"flag": False, "reason": ""}
        
        text_lower = text.lower()
        senior_keywords = ['senior', 'lead', 'principal', 'chief', 'vp', 'director', 'head of']
        
        has_senior_title = any(keyword in text_lower for keyword in senior_keywords)
        
        if has_senior_title and experience_years < 3:
            return {
                "flag": True,
                "reason": f"Senior-level title with only {experience_years} years of experience",
                "severity": "high"
            }
        
        return {"flag": False, "reason": ""}
    
    def check_unrealistic_achievements(self, text: str) -> Dict:
        """Check for unrealistic achievement claims"""
        
        if not text:
            return {"flag": False, "reason": ""}
        
        text_lower = text.lower()
        unrealistic_claims = []
        
        # Check for extreme percentage improvements
        percentage_pattern = r'(\d+)%\s*(improvement|increase|growth|boost)'
        matches = re.findall(percentage_pattern, text_lower)
        
        for match in matches:
            percentage = int(match[0])
            if percentage > 500:  # More than 500% is suspicious
                unrealistic_claims.append(f"{percentage}% {match[1]}")
        
        # Check for single-handedly claims
        single_handed_pattern = r'(single-handedly|solely|alone|by myself)'
        if re.search(single_handed_pattern, text_lower):
            unrealistic_claims.append("Claims of single-handedly achieving major results")
        
        if unrealistic_claims:
            return {
                "flag": True,
                "reason": f"Unrealistic claims: {', '.join(unrealistic_claims)}",
                "severity": "medium"
            }
        
        return {"flag": False, "reason": ""}
    
    def calculate_inflation_score(self, fraud_flags: List[Dict]) -> float:
        """Calculate overall inflation score (0-100)"""
        
        if not fraud_flags:
            return 0.0
        
        severity_weights = {
            'low': 10,
            'medium': 25,
            'high': 40
        }
        
        total_score = 0
        for flag in fraud_flags:
            if flag.get('flag'):
                severity = flag.get('severity', 'low')
                total_score += severity_weights.get(severity, 10)
        
        return min(total_score, 100.0)
    
    def analyze_resume(
        self,
        raw_text: str,
        skills: List[str],
        experience_years: float,
        candidate_name: Optional[str] = None
    ) -> Dict:
        """Perform comprehensive fraud detection analysis"""
        
        fraud_flags = []
        
        # Run all checks
        skill_check = self.check_skill_inflation(skills, experience_years)
        if skill_check['flag']:
            fraud_flags.append(skill_check)
        
        buzzword_check = self.check_buzzword_spam(raw_text)
        if buzzword_check['flag']:
            fraud_flags.append(buzzword_check)
        
        title_check = self.check_title_inflation(raw_text, experience_years)
        if title_check['flag']:
            fraud_flags.append(title_check)
        
        achievement_check = self.check_unrealistic_achievements(raw_text)
        if achievement_check['flag']:
            fraud_flags.append(achievement_check)
        
        # Calculate overall score
        inflation_score = self.calculate_inflation_score(fraud_flags)
        
        # Determine risk level
        if inflation_score >= 60:
            risk_level = "high"
        elif inflation_score >= 30:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            'inflation_score': round(inflation_score, 2),
            'risk_level': risk_level,
            'fraud_flags': [flag['reason'] for flag in fraud_flags if flag['flag']],
            'flag_count': len(fraud_flags),
            'details': fraud_flags
        }
    
    async def generate_ai_fraud_analysis(
        self,
        raw_text: str,
        candidate_name: str,
        skills: List[str],
        experience_years: float,
        rule_based_flags: List[str],
        inflation_score: float
    ) -> Dict:
        """Use AI to provide detailed fraud analysis"""
        
        provider = GenAIService.get_provider()
        
        prompt = f"""Analyze this resume for potential fraud, inflation, or suspicious claims.

**Resume Information:**
Candidate: {candidate_name}
Skills: {', '.join(skills[:20])}  # First 20 skills
Experience: {experience_years} years
Resume Text (excerpt): {raw_text[:1000]}

**Rule-Based Flags Detected:**
{', '.join(rule_based_flags) if rule_based_flags else 'None'}

**Inflation Score:** {inflation_score}/100

Please analyze and provide a JSON response:
{{
    "authenticity_assessment": "high/medium/low",
    "concerns": ["concern 1", "concern 2", "concern 3"],
    "red_flags": ["red flag 1", "red flag 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "verification_suggestions": ["verify item 1", "verify item 2"],
    "overall_verdict": "approve/investigate/reject",
    "reasoning": "1-2 sentences explaining the verdict"
}}

Focus on:
1. Consistency between skills, experience, and claims
2. Realistic achievement claims
3. Industry-standard career progression
4. Potential verification steps

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
                "authenticity_assessment": parsed.get("authenticity_assessment", "medium"),
                "concerns": parsed.get("concerns", []),
                "red_flags": parsed.get("red_flags", []),
                "recommendations": parsed.get("recommendations", []),
                "verification_suggestions": parsed.get("verification_suggestions", []),
                "overall_verdict": parsed.get("overall_verdict", "investigate"),
                "reasoning": parsed.get("reasoning", ""),
                "raw_response": response_text
            }
        except Exception as e:
            return {
                "authenticity_assessment": "medium",
                "concerns": [f"AI analysis failed: {str(e)}"],
                "red_flags": rule_based_flags,
                "recommendations": ["Manual review recommended"],
                "verification_suggestions": [],
                "overall_verdict": "investigate",
                "reasoning": "Unable to complete AI analysis",
                "raw_response": str(e)
            }

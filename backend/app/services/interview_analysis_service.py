import re
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.interview import Interview
from app.services.genai_service import GenAIService


class InterviewAnalysisService:
    """AI-powered interview analysis service"""
    
    def __init__(self):
        self.genai_provider = GenAIService.get_provider()
    
    async def analyze_interview_transcript(
        self,
        db: AsyncSession,
        interview_id: int
    ) -> Interview:
        """
        Comprehensive AI analysis of interview transcript
        
        Analyzes:
        - Sentiment
        - Confidence level
        - Communication quality
        - Technical assessment
        - Key points and highlights
        - Red flags
        - Overall recommendations
        """
        
        # Get interview
        result = await db.execute(
            select(Interview).filter(Interview.id == interview_id)
        )
        interview = result.scalars().first()
        
        if not interview:
            raise ValueError("Interview not found")
        
        if not interview.transcript:
            raise ValueError("No transcript available for analysis")
        
        transcript = interview.transcript
        
        # Run parallel analyses
        sentiment = await self._analyze_sentiment(transcript)
        confidence = await self._analyze_confidence(transcript)
        communication = await self._analyze_communication(transcript)
        technical = await self._analyze_technical_skills(transcript)
        key_points = await self._extract_key_points(transcript)
        red_flags = await self._detect_red_flags(transcript)
        
        # Generate comprehensive analysis
        comprehensive = await self._generate_comprehensive_analysis(
            transcript=transcript,
            sentiment=sentiment,
            confidence=confidence,
            communication=communication,
            technical=technical
        )
        
        # Calculate overall score
        overall_score = self._calculate_overall_score(
            sentiment=sentiment['score'],
            confidence=confidence['score'],
            communication=communication['score'],
            technical=technical['score']
        )
        
        # Update interview
        interview.sentiment_score = sentiment['score']
        interview.confidence_score = confidence['score']
        interview.communication_score = communication['score']
        interview.technical_score = technical['score']
        interview.overall_score = overall_score
        
        # Store detailed analysis
        interview.ai_analysis = {
            'sentiment': sentiment,
            'confidence': confidence,
            'communication': communication,
            'technical': technical,
            'key_points': key_points,
            'red_flags': red_flags,
            'comprehensive_analysis': comprehensive,
            'transcription_metadata': interview.ai_analysis.get('transcription_metadata', {})
        }
        
        await db.commit()
        await db.refresh(interview)
        
        return interview
    
    async def _analyze_sentiment(self, transcript: str) -> Dict:
        """Analyze overall sentiment of the interview"""
        
        prompt = f"""Analyze the sentiment of this interview transcript.

Transcript:
{transcript}

Provide:
1. Overall sentiment (positive, neutral, negative)
2. Sentiment score (-1.0 to 1.0, where -1 is very negative, 0 is neutral, 1 is very positive)
3. Brief explanation (2-3 sentences)

Format as JSON:
{{
    "sentiment": "positive/neutral/negative",
    "score": 0.0,
    "explanation": "..."
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            
            # Parse response
            import json
            result = json.loads(response)
            
            return {
                'sentiment': result.get('sentiment', 'neutral'),
                'score': float(result.get('score', 0.0)) * 100,  # Convert to 0-100
                'explanation': result.get('explanation', '')
            }
        except:
            # Fallback to basic analysis
            return self._basic_sentiment_analysis(transcript)
    
    def _basic_sentiment_analysis(self, transcript: str) -> Dict:
        """Simple rule-based sentiment analysis as fallback"""
        
        positive_words = ['great', 'excellent', 'good', 'love', 'enjoy', 'happy', 
                         'excited', 'amazing', 'wonderful', 'fantastic', 'best']
        negative_words = ['difficult', 'hard', 'problem', 'issue', 'struggle', 
                         'bad', 'worst', 'hate', 'dislike', 'fail', 'failed']
        
        text_lower = transcript.lower()
        
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        total = pos_count + neg_count
        if total == 0:
            score = 50  # Neutral
            sentiment = "neutral"
        else:
            score = (pos_count / total) * 100
            sentiment = "positive" if score > 60 else "negative" if score < 40 else "neutral"
        
        return {
            'sentiment': sentiment,
            'score': score,
            'explanation': f'Analysis based on keyword presence: {pos_count} positive, {neg_count} negative indicators.'
        }
    
    async def _analyze_confidence(self, transcript: str) -> Dict:
        """Analyze candidate's confidence level"""
        
        prompt = f"""Analyze the confidence level of the candidate based on this interview transcript.

Transcript:
{transcript}

Consider:
- Clarity of responses
- Use of filler words (um, uh, like)
- Definitiveness of statements
- Hesitation indicators

Provide:
1. Confidence level (low, medium, high)
2. Confidence score (0-100)
3. Key indicators (list of 3-5 points)

Format as JSON:
{{
    "level": "low/medium/high",
    "score": 0.0,
    "indicators": ["...", "..."]
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            result = json.loads(response)
            
            return {
                'level': result.get('level', 'medium'),
                'score': float(result.get('score', 50)),
                'indicators': result.get('indicators', [])
            }
        except:
            return self._basic_confidence_analysis(transcript)
    
    def _basic_confidence_analysis(self, transcript: str) -> Dict:
        """Basic confidence analysis"""
        
        filler_words = ['um', 'uh', 'like', 'you know', 'kind of', 'sort of']
        weak_phrases = ['i think', 'maybe', 'perhaps', 'probably', 'i guess']
        
        text_lower = transcript.lower()
        word_count = len(transcript.split())
        
        filler_count = sum(text_lower.count(word) for word in filler_words)
        weak_count = sum(text_lower.count(phrase) for phrase in weak_phrases)
        
        # Calculate score
        filler_ratio = (filler_count / word_count) * 100 if word_count > 0 else 0
        weak_ratio = (weak_count / word_count) * 100 if word_count > 0 else 0
        
        score = max(0, 100 - (filler_ratio * 20) - (weak_ratio * 15))
        
        level = "high" if score > 70 else "medium" if score > 40 else "low"
        
        return {
            'level': level,
            'score': round(score, 2),
            'indicators': [
                f'Filler words used: {filler_count} times',
                f'Weak phrases used: {weak_count} times',
                f'Overall clarity: {level}'
            ]
        }
    
    async def _analyze_communication(self, transcript: str) -> Dict:
        """Analyze communication skills"""
        
        prompt = f"""Analyze the communication skills demonstrated in this interview transcript.

Transcript:
{transcript}

Evaluate:
- Clarity of expression
- Structure of responses
- Vocabulary and language use
- Ability to articulate ideas

Provide:
1. Communication quality (poor, fair, good, excellent)
2. Score (0-100)
3. Strengths (list of 2-3)
4. Areas for improvement (list of 2-3)

Format as JSON:
{{
    "quality": "poor/fair/good/excellent",
    "score": 0.0,
    "strengths": ["...", "..."],
    "improvements": ["...", "..."]
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            result = json.loads(response)
            
            return {
                'quality': result.get('quality', 'fair'),
                'score': float(result.get('score', 50)),
                'strengths': result.get('strengths', []),
                'improvements': result.get('improvements', [])
            }
        except:
            # Fallback
            word_count = len(transcript.split())
            score = min(100, word_count / 2)  # Simple heuristic
            
            return {
                'quality': 'good' if score > 60 else 'fair',
                'score': score,
                'strengths': ['Clear verbal expression'],
                'improvements': ['Could provide more detailed responses']
            }
    
    async def _analyze_technical_skills(self, transcript: str) -> Dict:
        """Analyze technical competence from responses"""
        
        prompt = f"""Analyze the technical competence demonstrated in this interview transcript.

Transcript:
{transcript}

Look for:
- Use of technical terminology
- Depth of technical knowledge
- Problem-solving approaches
- Experience with technologies/tools

Provide:
1. Technical level (beginner, intermediate, advanced, expert)
2. Score (0-100)
3. Technical topics mentioned (list)
4. Assessment summary

Format as JSON:
{{
    "level": "beginner/intermediate/advanced/expert",
    "score": 0.0,
    "topics": ["...", "..."],
    "summary": "..."
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            result = json.loads(response)
            
            return {
                'level': result.get('level', 'intermediate'),
                'score': float(result.get('score', 50)),
                'topics': result.get('topics', []),
                'summary': result.get('summary', '')
            }
        except:
            return {
                'level': 'intermediate',
                'score': 60,
                'topics': [],
                'summary': 'Technical assessment requires more context.'
            }
    
    async def _extract_key_points(self, transcript: str) -> List[str]:
        """Extract key points from the interview"""
        
        prompt = f"""Extract the 5 most important points from this interview transcript.

Transcript:
{transcript}

Provide a list of key points (important statements, experiences, or qualifications mentioned).

Format as JSON:
{{
    "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            result = json.loads(response)
            return result.get('key_points', [])
        except:
            # Return first few sentences as fallback
            sentences = transcript.split('.')
            return [s.strip() + '.' for s in sentences[:5] if s.strip()]
    
    async def _detect_red_flags(self, transcript: str) -> List[str]:
        """Detect potential red flags in responses"""
        
        prompt = f"""Identify any potential red flags or concerns in this interview transcript.

Transcript:
{transcript}

Look for:
- Inconsistencies
- Negative attitudes
- Lack of relevant experience
- Communication issues
- Unprofessional language

Format as JSON:
{{
    "red_flags": ["flag 1", "flag 2", "..."],
    "severity": "low/medium/high"
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            result = json.loads(response)
            return result.get('red_flags', [])
        except:
            return []
    
    async def _generate_comprehensive_analysis(
        self,
        transcript: str,
        sentiment: Dict,
        confidence: Dict,
        communication: Dict,
        technical: Dict
    ) -> Dict:
        """Generate comprehensive hiring recommendation"""
        
        prompt = f"""Based on this interview analysis, provide a comprehensive hiring recommendation.

Interview Scores:
- Sentiment: {sentiment['score']}/100 ({sentiment['sentiment']})
- Confidence: {confidence['score']}/100 ({confidence['level']})
- Communication: {communication['score']}/100 ({communication['quality']})
- Technical: {technical['score']}/100 ({technical['level']})

Provide:
1. Overall recommendation (strong hire, hire, maybe, no hire)
2. Top 3 strengths
3. Top 3 concerns
4. Next steps suggestion

Format as JSON:
{{
    "recommendation": "strong hire/hire/maybe/no hire",
    "strengths": ["...", "...", "..."],
    "concerns": ["...", "...", "..."],
    "next_steps": "..."
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            return json.loads(response)
        except:
            return {
                'recommendation': 'maybe',
                'strengths': ['Completed interview', 'Provided responses'],
                'concerns': ['Requires detailed review'],
                'next_steps': 'Schedule follow-up discussion'
            }
    
    def _calculate_overall_score(
        self,
        sentiment: float,
        confidence: float,
        communication: float,
        technical: float
    ) -> float:
        """Calculate weighted overall interview score"""
        
        # Weights
        weights = {
            'sentiment': 0.15,
            'confidence': 0.25,
            'communication': 0.30,
            'technical': 0.30
        }
        
        overall = (
            sentiment * weights['sentiment'] +
            confidence * weights['confidence'] +
            communication * weights['communication'] +
            technical * weights['technical']
        )
        
        return round(overall, 2)


interview_analysis_service = InterviewAnalysisService()

import os
import asyncio
from pathlib import Path
from typing import Optional, Dict
import whisper
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.interview import Interview
from app.core.config import settings


class InterviewProcessingService:
    """Service for processing interview recordings"""
    
    def __init__(self):
        self.whisper_model = None
        self.recordings_dir = Path("recordings")
        self.recordings_dir.mkdir(exist_ok=True)
    
    def _load_whisper_model(self):
        """Lazy load Whisper model"""
        if self.whisper_model is None:
            print("Loading Whisper model (this may take a moment)...")
            # Using 'base' model - good balance of speed and accuracy
            # Options: tiny, base, small, medium, large
            self.whisper_model = whisper.load_model("base")
            print("Whisper model loaded!")
        return self.whisper_model
    
    async def save_recording(
        self,
        file_content: bytes,
        interview_id: int,
        file_extension: str
    ) -> str:
        """Save uploaded recording file"""
        
        # Create interview-specific directory
        interview_dir = self.recordings_dir / str(interview_id)
        interview_dir.mkdir(exist_ok=True)
        
        # Generate filename
        filename = f"recording_{interview_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
        filepath = interview_dir / filename
        
        # Save file
        with open(filepath, 'wb') as f:
            f.write(file_content)
        
        return str(filepath)
    
    async def transcribe_audio(
        self,
        audio_path: str,
        language: Optional[str] = None
    ) -> Dict:
        """
        Transcribe audio/video file using Whisper
        
        Returns:
            {
                'text': 'full transcript',
                'segments': [...],
                'language': 'en',
                'duration': 123.45
            }
        """
        
        try:
            # Load model
            model = self._load_whisper_model()
            
            # Transcribe in a thread pool (Whisper is CPU-intensive)
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: model.transcribe(
                    audio_path,
                    language=language,
                    verbose=False,
                    task='transcribe'
                )
            )
            
            return {
                'text': result['text'].strip(),
                'segments': result.get('segments', []),
                'language': result.get('language', 'unknown'),
                'duration': sum(seg['end'] - seg['start'] for seg in result.get('segments', []))
            }
        
        except Exception as e:
            print(f"Transcription error: {e}")
            raise ValueError(f"Failed to transcribe audio: {str(e)}")
    
    async def process_interview_recording(
        self,
        db: AsyncSession,
        interview_id: int,
        recording_path: str
    ) -> Interview:
        """Process interview recording: transcribe and update database"""
        
        # Get interview
        result = await db.execute(
            select(Interview).filter(Interview.id == interview_id)
        )
        interview = result.scalars().first()
        
        if not interview:
            raise ValueError("Interview not found")
        
        # Update status
        interview.processing_status = "processing"
        await db.commit()
        
        try:
            # Transcribe
            transcription = await self.transcribe_audio(recording_path)
            
            # Update interview with transcript
            interview.transcript = transcription['text']
            interview.recording_url = recording_path
            interview.processing_status = "completed"
            interview.is_processed = True
            
            # Store segments as JSON for future use
            if not interview.ai_analysis:
                interview.ai_analysis = {}
            
            interview.ai_analysis['transcription_metadata'] = {
                'language': transcription['language'],
                'duration_seconds': transcription['duration'],
                'segment_count': len(transcription['segments'])
            }
            
            await db.commit()
            await db.refresh(interview)
            
            return interview
        
        except Exception as e:
            # Update error status
            interview.processing_status = "failed"
            interview.processing_error = str(e)
            await db.commit()
            raise
    
    async def get_transcript_summary(
        self,
        transcript: str,
        max_length: int = 500
    ) -> str:
        """Get a summary of the transcript"""
        
        if len(transcript) <= max_length:
            return transcript
        
        # Simple truncation for now (we'll add AI summarization later)
        return transcript[:max_length] + "..."
    
    def extract_key_moments(
        self,
        segments: list,
        keywords: list = None
    ) -> list:
        """Extract key moments from transcript segments"""
        
        if keywords is None:
            keywords = [
                'experience', 'project', 'challenge', 'achievement',
                'technical', 'problem', 'solution', 'team', 'lead'
            ]
        
        key_moments = []
        
        for segment in segments:
            text_lower = segment['text'].lower()
            
            # Check if segment contains keywords
            if any(keyword in text_lower for keyword in keywords):
                key_moments.append({
                    'start_time': segment['start'],
                    'end_time': segment['end'],
                    'text': segment['text'].strip()
                })
        
        return key_moments[:10]  # Return top 10 moments


interview_processing_service = InterviewProcessingService()

from sqlalchemy.orm import Session
from typing import Dict, List
from backend.app.repositories.insight import InsightRepository
from backend.app.repositories.journal import JournalRepository
from backend.app.schemas.insight import InsightCreate, DashboardStats
from backend.app.models.insight import Insight
from backend.app.models.journal import Journal
from backend.app.services.gemini_service import GeminiService

class InsightService:
    @staticmethod
    def generate_insight_for_journal(db: Session, user_id: str, journal: Journal, conversation_context: str = None) -> Insight:
        # Check if insight already exists
        existing = InsightRepository.get_by_journal_id(db, journal_id=journal.id)
        if existing:
            return existing

        # 1. Add/Index current journal transcript in ChromaDB
        from backend.app.services.chroma_service import ChromaService
        ChromaService.add_journal(journal.id, journal.title, journal.transcript or "", user_id)

        # 2. Perform semantic search for most similar previous journal
        similar_id, score = ChromaService.find_most_similar_journal(journal.transcript or "", user_id, journal.id)
        
        # 3. Fetch matched similar entry and prepare context for Gemini
        previous_journals = []
        if similar_id:
            similar_journal_db = db.query(Journal).filter(Journal.id == similar_id).first()
            if similar_journal_db:
                previous_journals.append({
                    "id": similar_journal_db.id,
                    "title": similar_journal_db.title,
                    "transcript": similar_journal_db.transcript or "",
                    "created_at": similar_journal_db.created_at.isoformat() if similar_journal_db.created_at else ""
                })

        # Query Gemini Flash for comparative transcript analysis
        analysis_text = journal.transcript or ""
        if conversation_context:
            analysis_text = f"{conversation_context}\n\n[Current User Reflection]\n{analysis_text}"
        
        analysis = GeminiService.analyze_transcript(analysis_text, previous_journals)

        # Map to Pydantic Create schema
        insight_in = InsightCreate(
            journal_id=journal.id,
            summary=analysis.get("summary", ""),
            primary_emotion=analysis.get("primary_emotion", "neutral"),
            emotion_score=analysis.get("emotion_score", 0.5),
            stress_level=analysis.get("stress_level", 5),
            confidence_level=analysis.get("confidence_level", 5),
            energy_level=analysis.get("energy_level", 5),
            topics=analysis.get("topics", []),
            cognitive_distortions=analysis.get("cognitive_distortions", []),
            action_items=analysis.get("action_items", []),
            
            # Mood similarity parameters
            similar_journal_id=analysis.get("similar_journal_id"),
            similarity_explanation=analysis.get("similarity_explanation"),
            behavioral_insight=analysis.get("behavioral_insight"),
            previously_helpful_actions=analysis.get("previously_helpful_actions", []),
            
            # Legacy mapping compatibility
            emotion_details={analysis.get("primary_emotion", "neutral"): analysis.get("emotion_score", 0.5)},
            cognitive_patterns=analysis.get("cognitive_distortions", []),
            actionable_reflections=analysis.get("action_items", [])
        )

        return InsightRepository.create(db, insight_in=insight_in, user_id=user_id)

    @staticmethod
    def get_dashboard_stats(db: Session, user_id: str) -> DashboardStats:
        journals = JournalRepository.get_multi_by_user(db, user_id=user_id, limit=100)
        total_entries = len(journals)
        
        # Default fallback configurations
        mood_distribution = {"calm": 0, "anxious": 0, "sad": 0, "neutral": 0, "reflective": 0}
        distortions_count = {}
        
        for j in journals:
            mood_distribution[j.mood] = mood_distribution.get(j.mood, 0) + 1
            # Retrieve insights if related
            if j.insight:
                for pat in j.insight.cognitive_patterns or []:
                    distortions_count[pat] = distortions_count.get(pat, 0) + 1

        common_distortions = sorted(distortions_count, key=distortions_count.get, reverse=True)[:3]
        
        # Formulate a custom weekly reflection summary based on database counts
        if total_entries == 0:
            weekly_reflection = (
                "Welcome to CogniMirror. Record your first voice entry to begin mapping "
                "your cognitive landscapes."
            )
        elif mood_distribution.get("anxious", 0) > mood_distribution.get("calm", 0):
            weekly_reflection = (
                "You have experienced higher levels of anxiety this week. Try monitoring "
                "how catastrophizing loops play into your evening reflections."
            )
        else:
            weekly_reflection = (
                "Your mood profile shows relative calm and resilience. Keep reflecting "
                "consistently to maintain emotional baseline tracking."
            )

        return DashboardStats(
            total_entries=total_entries,
            weekly_reflection=weekly_reflection,
            mood_distribution=mood_distribution,
            common_distortions=common_distortions
        )

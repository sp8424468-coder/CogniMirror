import json
import requests
import traceback
from backend.app.core.config import settings

class GeminiService:
    @staticmethod
    def analyze_transcript(transcript: str, previous_journals: list = None) -> dict:
        """
        Analyze a transcript using Gemini REST API, comparing it with previous journals.
        """
        api_key = settings.GEMINI_API_KEY
        model_name = settings.GEMINI_MODEL
        
        # Logging before request
        print("\n" + "="*50)
        print("[GEMINI SERVICE] Starting AI Analysis")
        print(f"- Model: {model_name}")
        print(f"- Context Injected: {'Yes' if previous_journals else 'No'}")
        print(f"[GEMINI SERVICE] Exact transcript received from STT before preprocessing: \"{transcript}\"")
        if previous_journals:
            print(f"- Similar Journal Provided: ID={previous_journals[0].get('id')}")
        
        if not api_key:
            print("[GEMINI SERVICE] Error: API key missing.")
            return GeminiService._generate_mock_analysis(transcript, previous_journals, "GEMINI_API_KEY is not configured")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {
            "Content-Type": "application/json"
        }

        previous_context = ""
        if previous_journals:
            previous_context = "\nHere is a list of the user's highly relevant PREVIOUS journal entries for comparison:\n"
            for p in previous_journals:
                previous_context += f"- ID: {p.get('id')}, Title: {p.get('title')}, Transcript: \"{p.get('transcript')}\"\n"
            previous_context += """
            Compare the current transcript with these previous entries.
            Identify which past journal is MOST SIMILAR in emotional tone, cognitive patterns, or topics.
            If you find one, return its exact ID in the "similar_journal_id" field, explain why they are similar in "similarity_explanation", and list what actionable behaviors or reframing thoughts previously improved the user's mood.
            """

        prompt = f"""
        You are an expert cognitive behavioral companion.
        CRITICAL INSTRUCTIONS:
        1. Analyze ONLY the user's current reflection unless a highly relevant previous journal is provided. Never invent events, situations, or topics that the user did not mention.
        2. Treat multilingual transcripts as literal user reflections. Do not reinterpret colloquial expressions into stronger psychological or legal terms. Never infer words like harassment, abuse, trauma, addiction, depression, or similar unless they are explicitly stated by the user.
        3. Preserve the user's wording as much as possible. If the meaning is ambiguous, state that it appears to indicate stress or pressure rather than inventing a stronger interpretation.
        
        Analyze the following journal transcript to identify emotions, stress levels, energy metrics, topics, cognitive distortions, and actionable reframing tasks.
        {previous_context}

        Transcript:
        \"\"\"{transcript}\"\"\"

        You MUST respond ONLY with a single JSON object containing these exact properties:
        1. "summary": A concise 2-3 sentence cognitive summary of the user's reflection state.
        2. "primary_emotion": The dominant emotion detected.
        3. "emotion_score": A float (0.0 to 1.0).
        4. "stress_level": An integer (1 to 10).
        5. "confidence_level": An integer (1 to 10).
        6. "energy_level": An integer (1 to 10).
        7. "topics": A JSON array of short strings.
        8. "cognitive_distortions": A JSON array of strings.
        9. "action_items": A JSON array of 2-3 actionable cognitive reframing prompts.
        10. "similar_journal_id": Exact ID of similar past journal (or null).
        11. "similarity_explanation": Explanation of similarity (or null).
        12. "previously_helpful_actions": JSON array of strings listing actions that improved mood (or empty).
        13. "behavioral_insight": A personalized behavioral observation (2-3 concise sentences). Focus on behavioral indicators. DO NOT give medical advice.
        """

        print(f"[GEMINI SERVICE] Exact prompt sent to Gemini:\n{prompt}\n")

        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code != 200:
                error_msg = f"API Error ({response.status_code}): {response.text}"
                print(f"[GEMINI SERVICE] {error_msg}")
                return GeminiService._generate_mock_analysis(transcript, previous_journals, error_msg)
            
            res_json = response.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                error_msg = "No candidates returned by Gemini API"
                print(f"[GEMINI SERVICE] {error_msg}")
                return GeminiService._generate_mock_analysis(transcript, previous_journals, error_msg)
            
            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
            parsed_analysis = json.loads(text)
            
            # Ensure non-mock identification
            parsed_analysis["is_mock"] = False
            parsed_analysis["fallback_reason"] = None
            
            print("[GEMINI SERVICE] Success - Response received from AI")
            print("="*50 + "\n")
            
            # Fill missing keys dynamically if any failed
            required_keys = [
                "summary", "primary_emotion", "emotion_score", "stress_level",
                "confidence_level", "energy_level", "topics", "cognitive_distortions",
                "action_items", "similar_journal_id", "similarity_explanation",
                "previously_helpful_actions", "behavioral_insight"
            ]
            for key in required_keys:
                if key not in parsed_analysis:
                    parsed_analysis[key] = None
            
            return parsed_analysis
            
        except requests.exceptions.Timeout:
            error_msg = "Gemini API request timed out"
            print(f"[GEMINI SERVICE] Timeout Error: {error_msg}")
            return GeminiService._generate_mock_analysis(transcript, previous_journals, error_msg)
        except Exception as e:
            error_msg = f"Exception: {str(e)}\n{traceback.format_exc()}"
            print(f"[GEMINI SERVICE] Critical Failure:\n{error_msg}")
            return GeminiService._generate_mock_analysis(transcript, previous_journals, str(e))

    @staticmethod
    def _generate_mock_analysis(transcript: str, previous_journals: list = None, fallback_reason: str = "Unknown error") -> dict:
        """
        Local simulation helper for fallback analysis matching transcript keywords
        """
        print(f"[GEMINI SERVICE] Generating Mock Analysis. Reason: {fallback_reason}")
        print("="*50 + "\n")
        
        lower = transcript.lower()
        primary = "reflective"
        score = 0.7
        stress = 4
        confidence = 6
        energy = 5
        topics = ["daily reflection"]
        distortions = []
        
        if any(w in lower for w in ["anxious", "anxiety", "stressed", "overwhelmed", "deadline", "tasks", "hackathon"]):
            primary = "anxious"
            score = 0.8
            stress = 7
            confidence = 4
            energy = 6
            topics = ["stress", "workload"]
            distortions = ["Catastrophizing", "All-or-Nothing Thinking"]
        elif any(w in lower for w in ["sad", "depressed", "down", "lonely", "exhausted"]):
            primary = "sad"
            score = 0.75
            stress = 6
            confidence = 3
            energy = 2
            topics = ["emotional fatigue", "isolation"]
            distortions = ["Emotional Reasoning", "Overgeneralization"]
        elif any(w in lower for w in ["happy", "great", "joy", "excited", "good", "calm", "prize", "won", "achievement"]):
            primary = "calm"
            score = 0.85
            stress = 2
            confidence = 8
            energy = 7
            topics = ["resilience", "positivity", "achievement"]
            distortions = []

        summary = (
            f"The reflection suggests a {primary} mental landscape. "
            "You are observing your thoughts and evaluating current events with relative clarity."
        )
        if primary == "anxious":
            summary = "You expressed anxious loops regarding deadlines and future tasks. You show signs of anticipatory stress."
        elif primary == "sad":
            summary = "Your entry reflects low self-belief, physical fatigue, and downheartedness."

        action_items = [
            "Write down the single most important task you can accomplish in 10 minutes.",
            "Take 5 slow breaths, focusing on relaxing your shoulder muscles."
        ]

        similar_id = None
        sim_explanation = None
        prev_helpful = []
        
        if previous_journals and len(previous_journals) > 0:
            similar_id = previous_journals[0].get("id")
            sim_explanation = f"Both today's reflection and the entry '{previous_journals[0].get('title')}' express similar worry levels regarding goals and scheduling pressure."
            prev_helpful = [
                "Listing the immediate next action on paper."
            ]
        
        return {
            "summary": summary,
            "primary_emotion": primary,
            "emotion_score": score,
            "stress_level": stress,
            "confidence_level": confidence,
            "energy_level": energy,
            "topics": topics,
            "cognitive_distortions": distortions,
            "action_items": action_items,
            "similar_journal_id": similar_id,
            "similarity_explanation": sim_explanation,
            "previously_helpful_actions": prev_helpful,
            "behavioral_insight": "You tend to experience a distinct rise in anxious patterns during high-stakes events. Reframing your perspective and taking structured breaks has previously helped establish calm.",
            "is_mock": True,
            "fallback_reason": fallback_reason
        }

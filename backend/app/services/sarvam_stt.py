import os
import requests
from backend.app.core.config import settings

class SarvamSTTService:
    @staticmethod
    def transcribe(file_path: str) -> dict:
        """
        Transcribe an audio file using Sarvam AI Speech-to-Text API.
        If SARVAM_API_KEY is not configured in the environment, it returns a mock transcription.
        """
        api_key = settings.SARVAM_API_KEY
        
        # Fallback to simulated STT if API key is missing
        if not api_key:
            print("Sarvam API key missing. Auto-generating simulated transcription...")
            return {
                "transcript": (
                    "I am reflecting on my day. Sometimes things feel a bit fast-paced, "
                    "and I get anxious about completing all milestones on time. "
                    "But focusing on what is in control helps keep me calm."
                ),
                "detected_language": "en",
                "confidence_score": 0.96
            }

        url = "https://api.sarvam.ai/speech-to-text"
        headers = {
            "api-subscription-key": api_key
        }
        
        try:
            import mimetypes
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = "audio/wav"
            # Open file and submit multipart POST request
            with open(file_path, "rb") as audio_file:
                files = {
                    "file": (os.path.basename(file_path), audio_file, mime_type)
                }
                data = {
                    "model": "saaras:v3",
                    "mode": "transcribe"
                }
                
                response = requests.post(url, headers=headers, files=files, data=data, timeout=30)
                
                if response.status_code != 200:
                    print(f"Sarvam API error ({response.status_code}): {response.text}")
                    # Return error description or fallback gracefully
                    return {
                        "transcript": "Error transcribing audio via Sarvam STT API.",
                        "detected_language": "en",
                        "confidence_score": 0.0
                    }
                
                res_json = response.json()
                
                # Extract response parameters
                transcript = res_json.get("transcript", "")
                language_code = res_json.get("language_code", "en")
                
                # Mock or extract confidence (Sarvam REST API does not always return confidence, so we default to 0.98)
                confidence = res_json.get("confidence", 0.98)
                
                return {
                    "transcript": transcript,
                    "detected_language": language_code,
                    "confidence_score": confidence
                }
                
        except Exception as e:
            print(f"Exception during Sarvam STT request: {e}")
            return {
                "transcript": "Failed to connect to Sarvam STT API.",
                "detected_language": "en",
                "confidence_score": 0.0
            }

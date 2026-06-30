"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Mic,
  Square,
  Pause,
  Play,
  Trash2,
  Sparkles,
  ArrowLeft,
  Volume2,
  Brain,
  MessageSquareCode,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translationService } from "@/services/TranslationService";

export default function VoiceJournalPage() {
  const { token } = useAuth();
  const router = useRouter();

  // State Machine
  // 'idle' | 'recording' | 'paused' | 'playback' | 'analysis'
  const [status, setStatus] = useState<"idle" | "recording" | "paused" | "playback" | "analysis">("idle");
  const [time, setTime] = useState(0); // Time in milliseconds
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("en");
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sessionContext, setSessionContext] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Translation States
  const [responseLanguage, setResponseLanguage] = useState("en");
  const [rememberLanguage, setRememberLanguage] = useState(false);
  const [translatedAnalysis, setTranslatedAnalysis] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const LANGUAGES = [
    { code: "en", name: "English", locale: "en-US" },
    { code: "kn", name: "ಕನ್ನಡ", locale: "kn-IN" },
    { code: "hi", name: "हिन्दी", locale: "hi-IN" },
    { code: "ta", name: "தமிழ்", locale: "ta-IN" },
    { code: "te", name: "తెలుగు", locale: "te-IN" },
    { code: "ml", name: "മലയാളം", locale: "ml-IN" },
  ];
  
  // Custom audio element playback state
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const processingSteps = [
    "Transcribing voice signals...",
    "Translating and formatting text...",
    "Scanning for cognitive distortions...",
    "Saving to Cognitive Companion database...",
  ];

  // Clean up timers on unmount
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredResponseLanguage");
    if (savedLang) {
      setResponseLanguage(savedLang);
      setRememberLanguage(true);
    }
    
    return () => {
      stopTimer();
      stopPlaybackTimer();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Translations
  useEffect(() => {
    const applyTranslation = async () => {
      if (!analysisResult) return;
      
      setIsTranslating(true);
      try {
        let currentLang = responseLanguage;
        
        // Auto-select detected language if no pref saved
        if (!rememberLanguage && !localStorage.getItem("preferredResponseLanguage") && detectedLanguage && detectedLanguage !== "en") {
           const matchingLang = LANGUAGES.find(l => l.code === detectedLanguage);
           if (matchingLang && currentLang === "en") {
             currentLang = detectedLanguage;
             setResponseLanguage(currentLang);
           }
        }

        const step1 = await translationService.translateObject(analysisResult, currentLang, [
          "summary", 
          "behavioral_insight", 
          "similarity_explanation"
        ]);
        const finalTranslated = await translationService.translateObject(step1, currentLang, [
           "action_items",
           "previously_helpful_actions",
           "cognitive_distortions"
        ]);
        setTranslatedAnalysis(finalTranslated);
      } finally {
        setIsTranslating(false);
      }
    };
    applyTranslation();
  }, [analysisResult, responseLanguage]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setResponseLanguage(lang);
    if (rememberLanguage) {
      localStorage.setItem("preferredResponseLanguage", lang);
    }
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberLanguage(checked);
    if (checked) {
      localStorage.setItem("preferredResponseLanguage", responseLanguage);
    } else {
      localStorage.removeItem("preferredResponseLanguage");
    }
  };

  // Timer utilities
  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setTime((prev) => prev + 10); // Increment every 10ms (centiseconds)
    }, 10);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const formatTimer = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  };

  // Upload and Transcribe background pipeline
  const uploadAndTranscribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio_file", blob, "reflection_audio.webm");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/journals/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const resData = await response.json();
      setAudioUrl(resData.audio_url);
      setTranscriptText(resData.transcript);
      setDetectedLanguage(resData.detected_language);
      setConfidenceScore(resData.confidence_score);
    } catch (err) {
      console.warn("FastAPI offline or upload error. Simulating client STT transcription...", err);
      // Mock Fallback
      setTimeout(() => {
        setAudioUrl("https://mock-storage.supabase.co/audio/sample.mp3");
        setTranscriptText(
          "I am reflecting on my workload today. I have some anxious patterns because " +
          "of the upcoming deploy. But taking a walk helped me collect my thoughts."
        );
        setDetectedLanguage("en");
        setConfidenceScore(0.98);
      }, 2000);
    } finally {
      // Small timeout to allow UI transition states
      setTimeout(() => {
        setIsTranscribing(false);
      }, 2000);
    }
  };

  // MediaRecorder handlers
  const handleStartRecording = async () => {
    audioChunksRef.current = [];
    setRecordedBlob(null);
    setAudioUrl(null);
    setTranscriptText("");
    setConfidenceScore(null);
    setTime(0);
    
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(audioBlob);
        if (!title) {
          setTitle(`Reflection - ${new Date().toLocaleDateString()}`);
        }
        // Auto upload and transcribe background thread
        uploadAndTranscribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setStatus("recording");
      startTimer();
    } catch (err) {
      console.error("Microphone access unavailable.", err);
      setError("Microphone access denied or unavailable. Please check your browser permissions.");
      setStatus("idle");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    setStatus("paused");
    stopTimer();
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    setStatus("recording");
    startTimer();
  };

  const handleStopRecording = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setStatus("playback");
    } else {
      setStatus("idle");
    }
  };

  const handleDeleteRecording = () => {
    stopPlayback();
    setRecordedBlob(null);
    setAudioUrl(null);
    setTime(0);
    setTitle("");
    setTranscriptText("");
    setConfidenceScore(null);
    setStatus("idle");
  };

  // Playback control mechanisms
  const togglePlayPlayback = () => {
    if (!audioUrl) return;

    if (!audioPlaybackRef.current) {
      audioPlaybackRef.current = new Audio(audioUrl);
      audioPlaybackRef.current.onended = () => {
        setIsPlayingBack(false);
        stopPlaybackTimer();
        setPlaybackTime(0);
      };
    }

    if (isPlayingBack) {
      audioPlaybackRef.current.pause();
      setIsPlayingBack(false);
      stopPlaybackTimer();
    } else {
      audioPlaybackRef.current.play().catch(() => {
        // Fallback for mocked storage URL
        console.warn("Simulating audio track playback...");
      });
      setIsPlayingBack(true);
      startPlaybackTimer();
    }
  };

  const startPlaybackTimer = () => {
    stopPlaybackTimer();
    playbackTimerRef.current = setInterval(() => {
      setPlaybackTime((prev) => {
        // Mock progression up to duration limit
        const limit = time;
        if (prev + 100 >= limit) {
          stopPlayback();
          return 0;
        }
        return prev + 100;
      });
    }, 100);
  };

  const stopPlaybackTimer = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  const stopPlayback = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current.currentTime = 0;
    }
    setIsPlayingBack(false);
    stopPlaybackTimer();
    setPlaybackTime(0);
  };

  const handleProcessEntry = async () => {
    setIsProcessing(true);
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1200);

    try {
      if (recordedBlob) {
        console.log("Processing audio blob of size:", recordedBlob.size);
      }
      const formData = new FormData();
      formData.append("title", title || "Voice Journal Entry");
      if (transcriptText) {
        formData.append("transcript", transcriptText);
      }
      if (audioUrl) {
        formData.append("audio_url", audioUrl);
      }
      if (detectedLanguage) {
        formData.append("detected_language", detectedLanguage);
      }
      if (confidenceScore !== null) {
        formData.append("confidence_score", String(confidenceScore));
      }

      if (sessionContext) {
        formData.append("conversation_context", sessionContext);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/journals/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload journal");
      }
      
      const journalData = await response.json();
      
      // Fetch generated insight
      const insightRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/insights/journal/${journalData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (insightRes.ok) {
        const insightData = await insightRes.json();
        setAnalysisResult(insightData);
      }

      clearInterval(stepInterval);
      setIsProcessing(false);
      setStatus("analysis");
    } catch (err) {
      console.warn("Backend offline. Completing sandbox mock save...", err);
      setTimeout(() => {
        clearInterval(stepInterval);
        setIsProcessing(false);
        setAnalysisResult({ summary: "Mock analysis summary for disconnected state." });
        setStatus("analysis");
      }, 5000);
    }
  };

  const handleReadAloud = () => {
    if (!translatedAnalysis) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      let textToRead = translatedAnalysis.summary || "";
      if (translatedAnalysis.behavioral_insight) {
        textToRead += ". " + translatedAnalysis.behavioral_insight;
      }
      if (translatedAnalysis.action_items && translatedAnalysis.action_items.length > 0) {
        textToRead += ". " + translatedAnalysis.action_items.join(". ");
      }

      const utterance = new SpeechSynthesisUtterance(textToRead);
      const selectedLangObj = LANGUAGES.find(l => l.code === responseLanguage);
      const locale = selectedLangObj ? selectedLangObj.locale : "en-US";
      utterance.lang = locale;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find((v) => v.lang.startsWith(responseLanguage));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        } else {
           const fallback = voices.find((v) => v.lang.startsWith("en"));
           if (fallback) utterance.voice = fallback;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsSpeechPaused(false);
        setShowFeedback(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
        setShowFeedback(true);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
        setShowFeedback(true);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePauseSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    }
  };

  const handleResumeSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
    }
  };

  const handleStopSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setShowFeedback(true);
    }
  };

  const handleTalkAgain = () => {
    // Append previous session info to context for continuous conversation
    let previous = sessionContext ? sessionContext + "\n\n" : "";
    previous += `[Previous User Thoughts]: ${transcriptText}\n`;
    if (analysisResult?.summary) {
      previous += `[Previous AI Advice]: ${analysisResult.summary}`;
    }
    setSessionContext(previous);
    setShowFeedback(false);
    setAnalysisResult(null);
    setTranscriptText("");
    setStatus("idle");
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 select-none relative">
      {/* Analysis Stepper Fullscreen Cover */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#09090B]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6"
          >
            <div className="relative w-16 h-16 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
              <div className="absolute inset-2 rounded-full border-b-2 border-accent animate-spin [animation-direction:reverse]" />
              <Sparkles size={20} className="text-accent" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white select-none">
              Analyzing Mental Landscape
            </h3>

            <div className="flex flex-col gap-3.5 max-w-sm w-full px-8">
              {processingSteps.map((step, idx) => {
                const isActive = idx === processingStep;
                const isCompleted = idx < processingStep;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3.5 transition-all duration-300 ${
                      isActive
                        ? "text-accent opacity-100 scale-102 font-medium"
                        : isCompleted
                        ? "text-zinc-500 opacity-60"
                        : "text-zinc-600 opacity-40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? "bg-accent text-[#09090B]"
                          : isCompleted
                          ? "bg-zinc-800 text-zinc-400"
                          : "bg-zinc-900 text-zinc-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-xs">{step}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft size={12} />
          <span>Back to dashboard</span>
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-white">Voice Journaling</h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Record your voice freely. Our AI pipeline handles dialects and patterns structure.
        </p>
      </div>

      {status !== "analysis" && (
      <Card className="flex flex-col items-center justify-center py-16 gap-8 relative min-h-[420px] overflow-hidden">
        {/* Soft Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Large Pulsing Spheres behind main buttons */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/3 rounded-full blur-[60px] pointer-events-none" />

        {/* State 1: IDLE - Large Microphone button */}
        {status === "idle" && (
          <div className="flex flex-col items-center gap-8">
            {error && (
              <div className="w-full max-w-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center animate-in fade-in">
                {error}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRecording}
              className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 flex items-center justify-center cursor-pointer text-primary transition-all relative group shadow-[0_0_30px_rgba(124,58,237,0.15)] hover:shadow-[0_0_40px_rgba(124,58,237,0.35)]"
            >
              <div className="absolute inset-1 rounded-full border border-primary/30 animate-pulse group-hover:scale-102 transition-transform" />
              <Mic size={32} className="relative z-10" />
            </motion.button>

            <div className="text-center max-w-sm select-none">
              <span className="text-sm font-semibold text-zinc-200 block">Tap microphone to begin reflection</span>
              <span className="text-xs text-zinc-500 block mt-1.5 leading-relaxed">
                Reflect naturally. We transcribe audio structures and analyze emotional patterns.
              </span>
            </div>
          </div>
        )}

        {/* State 2 & 3: RECORDING & PAUSED - Waves, Timers, Pause/Stop CTA */}
        {(status === "recording" || status === "paused") && (
          <div className="flex flex-col items-center gap-8 w-full">
            {/* Dynamic Soundwaves */}
            <div className="flex items-center justify-center gap-1.5 h-16 w-full px-8">
              {[...Array(16)].map((_, i) => {
                const animationClass = status === "recording" ? "animate-wave" : "";
                return (
                  <div
                    key={i}
                    className={`w-1.5 bg-accent rounded-full transition-all duration-300 ${animationClass}`}
                    style={{
                      height: status === "recording" ? `${20 + Math.sin(i * 0.5) * 60}%` : "15%",
                      animationDelay: `${i * 0.08}s`,
                      transformOrigin: "center",
                    }}
                  />
                );
              })}
            </div>

            {/* Milliseconds Counter */}
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold tracking-wider text-white font-mono select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                {formatTimer(time)}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 animate-pulse">
                {status === "recording" ? "Recording audio stream" : "Recording session paused"}
              </span>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-6 z-10">
              {/* Pause / Resume Button */}
              {status === "recording" ? (
                <button
                  onClick={handlePauseRecording}
                  className="w-12 h-12 rounded-full bg-zinc-800/80 border border-white/5 hover:bg-zinc-700/80 flex items-center justify-center cursor-pointer text-zinc-300 transition-all"
                  title="Pause Recording"
                >
                  <Pause size={18} />
                </button>
              ) : (
                <button
                  onClick={handleResumeRecording}
                  className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 hover:bg-primary/30 flex items-center justify-center cursor-pointer text-primary transition-all animate-bounce"
                  title="Resume Recording"
                >
                  <Play size={18} />
                </button>
              )}

              {/* Stop Button */}
              <button
                onClick={handleStopRecording}
                className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center cursor-pointer text-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                title="Stop & Save"
              >
                <Square size={20} />
              </button>
            </div>
          </div>
        )}

        {/* State 4: PLAYBACK - Review, Discard, Process Dashboard */}
        {status === "playback" && (
          <div className="flex flex-col items-center gap-6 w-full px-8 select-none">
            {isTranscribing ? (
              /* Transcribing Loading Animation */
              <div className="flex flex-col items-center gap-6 w-full py-6">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" />
                  <div className="absolute inset-2 rounded-full border-b-2 border-primary animate-spin [animation-direction:reverse]" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-zinc-200 animate-pulse block">Transcribing Vocal Signals...</span>
                  <span className="text-[10px] text-zinc-500 block mt-1.5 uppercase tracking-wider">Running Sarvam STT engine</span>
                </div>
              </div>
            ) : (
              /* Transcription Ready Display */
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                  <Volume2 size={24} />
                </div>

                <div className="text-center">
                  <span className="text-sm font-semibold text-zinc-200">Journal Reflection Captured</span>
                  <span className="text-xs text-zinc-500 block mt-1">Review your voice entry before scanning patterns</span>
                </div>
              </div>
            )}

            {/* Custom styled audio seek progress track */}
            <div className="w-full max-w-md bg-zinc-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <button
                onClick={togglePlayPlayback}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer text-white transition-colors"
                disabled={isTranscribing}
              >
                {isPlayingBack ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-100"
                    style={{ width: `${(playbackTime / (time || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>{formatTimer(playbackTime).substring(0, 5)}</span>
                  <span>{formatTimer(time).substring(0, 5)}</span>
                </div>
              </div>
            </div>

            {/* Discard & Process buttons */}
            <div className="flex gap-4 w-full max-w-md mt-4 z-10">
              <Button
                variant="secondary"
                onClick={handleDeleteRecording}
                className="flex-1 flex items-center justify-center gap-2 border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                disabled={isTranscribing}
              >
                <Trash2 size={14} />
                <span>Discard</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleProcessEntry}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={isTranscribing || !transcriptText}
              >
                <Sparkles size={14} className="text-accent" />
                <span>Analyze Reflection</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
      )}

      {/* Review transcript text area - Premium update for playback state */}
      {status === "playback" && !isTranscribing && transcriptText && (
        <Card className="p-6 border-white/5">
          <div className="flex items-center gap-2.5 mb-4 select-none">
            <Languages size={15} className="text-accent" />
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Review and Edit Transcript
            </span>
            {confidenceScore !== null && (
              <span className="ml-auto text-[9px] font-bold text-zinc-400 bg-white/4 border border-white/5 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                Detected: {detectedLanguage} ({Math.round(confidenceScore * 100)}% Match)
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Journal Title"
              placeholder="Title for today's reflection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 select-none">Reflection Text</label>
              <textarea
                className="w-full min-h-[120px] bg-[#18181B]/80 text-[#FAFAFA] border border-white/8 rounded-xl px-4 py-2.5 text-sm transition-all placeholder:text-zinc-500 focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Write manual backup panel */}
      {status === "idle" && (
        <Card className="p-6 border-white/5">
          <div className="flex items-center gap-2 mb-4 select-none">
            <MessageSquareCode size={16} className="text-zinc-500" />
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Or write reflections manually
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Journal Title"
              placeholder="Title for today's reflection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 select-none">Reflection Text</label>
              <textarea
                className="w-full min-h-[120px] bg-[#18181B]/80 text-[#FAFAFA] border border-white/8 rounded-xl px-4 py-2.5 text-sm transition-all placeholder:text-zinc-500 focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                placeholder="What is occupying your thoughts right now?"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
              />
            </div>
            {title && transcriptText && (
              <Button
                variant="primary"
                onClick={handleProcessEntry}
                className="w-full flex items-center justify-center gap-2"
              >
                <Brain size={14} className="text-accent" />
                <span>Analyze Text Reflection</span>
              </Button>
            )}
          </div>
        </Card>
      )}
      {/* End main conditional container */}
      {status !== "analysis" && (
        <div className="hidden" /> // Spacer for conditional rendering wrapper close
      )}

      {/* State 5: Analysis Result */}
      {status === "analysis" && translatedAnalysis && (
        <div className="flex flex-col gap-6 w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500 text-left mx-auto">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> AI Companion Analysis
          </h2>
          
          {isTranslating ? (
            <div className="p-12 border border-white/5 bg-zinc-900/60 rounded-xl flex items-center justify-center min-h-[200px]">
              <span className="text-zinc-500 animate-pulse text-sm">Translating response...</span>
            </div>
          ) : (
            <div className="p-6 border border-white/5 bg-zinc-900/60 rounded-xl flex flex-col gap-5">
              <p className="text-zinc-200 text-sm font-light leading-relaxed">
                {translatedAnalysis.summary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {translatedAnalysis.behavioral_insight && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block mb-2">Behavioral Insight</span>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">{translatedAnalysis.behavioral_insight}</p>
                  </div>
                )}
                
                {translatedAnalysis.action_items && translatedAnalysis.action_items.length > 0 && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Guided Action Plan</span>
                    <ul className="list-disc pl-4 text-xs text-zinc-300 font-light flex flex-col gap-1.5">
                      {translatedAnalysis.action_items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Language Selector & TTS Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">🌐 Response Language:</span>
                <select 
                  className="bg-zinc-900 border border-white/10 text-white text-xs rounded-md px-2 py-1 outline-hidden hover:border-white/20 transition-colors"
                  value={responseLanguage}
                  onChange={handleLanguageChange}
                  disabled={isTranslating}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  className="rounded-sm border-white/10 bg-zinc-900 accent-primary w-3 h-3 cursor-pointer"
                  checked={rememberLanguage}
                  onChange={handleRememberChange}
                />
                <span className="text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors">☑ Remember my preferred language</span>
              </label>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!isSpeaking ? (
                <Button variant="secondary" onClick={handleReadAloud} className="flex items-center gap-2 text-xs h-8" disabled={isTranslating}>
                  <Volume2 size={14} />
                  <span>Listen to AI Companion</span>
                </Button>
              ) : (
              <div className="flex items-center gap-2 bg-zinc-900/60 p-1 rounded-md border border-white/5">
                {isSpeechPaused ? (
                  <Button variant="ghost" onClick={handleResumeSpeech} className="h-7 px-3 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                    <Play size={12} />
                    <span>Resume</span>
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={handlePauseSpeech} className="h-7 px-3 flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
                    <Pause size={12} />
                    <span>Pause</span>
                  </Button>
                )}
                <div className="w-px h-4 bg-white/10" />
                <Button variant="ghost" onClick={handleStopSpeech} className="h-7 px-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <Square size={12} />
                  <span>Stop</span>
                </Button>
              </div>
            )}
          </div>
        </div>

          {showFeedback && (
            <div className="flex flex-col gap-3 mt-4 p-5 rounded-xl bg-zinc-950 border border-white/5 animate-in slide-in-from-bottom-4 duration-500">
              <span className="text-sm font-semibold text-zinc-300 text-center">Did this advice help you?</span>
              <div className="flex items-center justify-center gap-3">
                <Button variant="secondary" onClick={() => setShowFeedback(false)} className="px-6">👍 Yes</Button>
                <Button variant="secondary" onClick={() => setShowFeedback(false)} className="px-6">👎 No</Button>
                <Button variant="primary" onClick={handleTalkAgain} className="flex items-center gap-2 px-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Mic size={14} />
                  <span>Talk Again</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

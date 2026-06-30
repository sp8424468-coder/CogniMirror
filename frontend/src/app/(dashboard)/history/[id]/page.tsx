"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Calendar,
  Volume2,
  Play,
  Pause,
  Square,
  Languages,
  Sparkles,
  Smile,
  AlertTriangle,
  BrainCircuit,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";

interface Insight {
  id: string;
  summary: string;
  primary_emotion?: string;
  emotion_score?: number;
  stress_level?: number;
  confidence_level?: number;
  energy_level?: number;
  topics?: string[];
  cognitive_distortions?: string[];
  action_items?: string[];
  similar_journal_id?: string;
  similarity_explanation?: string;
  behavioral_insight?: string;
  previously_helpful_actions?: string[];
}

interface Journal {
  id: string;
  title: string;
  mood: string;
  created_at: string;
  transcript?: string;
  audio_url?: string;
  detected_language?: string;
  confidence_score?: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JournalDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  
  const { token } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // TTS States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  // Load data
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Journal details
        const journalRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/journals/${id}`, { headers });
        if (!journalRes.ok) throw new Error("Failed to load journal");
        const journalData = await journalRes.json();
        setJournal(journalData);

        // 2. Fetch Insight details
        const insightRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/insights/journal/${id}`, { headers });
        if (insightRes.ok) {
          const insightData = await insightRes.json();
          setInsight(insightData);
        }
      } catch (err) {
        console.warn("Backend offline, utilizing simulated static detail fallback...", err);
        showToast("Backend connection issue. Utilizing offline simulated details.", "info");
        // Fallback Mock
        setJournal({
          id: id,
          title: "Dealing with deadline pressure",
          mood: "anxious",
          created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          transcript: "I feel overwhelmed with the upcoming roadmap push. There is so much to coordinate. If we miss the deadline, everything might collapse, and I will be blamed.",
          audio_url: "https://mock-storage.supabase.co/audio/sample.mp3",
          detected_language: "en",
          confidence_score: 0.98,
        });

        setInsight({
          id: "ins_1",
          summary: "You are experiencing elevated anxiety concerning deliverables and showing catastrophizing and personalization loops.",
          primary_emotion: "anxious",
          emotion_score: 0.85,
          stress_level: 7,
          confidence_level: 4,
          energy_level: 6,
          topics: ["milestones", "deployments", "overwork"],
          cognitive_distortions: ["Catastrophizing", "Personalization"],
          action_items: [
            "Outline tasks that are strictly under your control versus dependencies.",
            "Challenge the catastrophizing thought: what is the most realistic outcome?"
          ],
          similar_journal_id: "j_prev",
          similarity_explanation: "Similar schedule anxiety was expressed in 'Morning reflection on calm walk' where future-oriented workload blocks was resolved after deep breathing prompts.",
          previously_helpful_actions: [
            "Listing current dependencies on a whiteboard.",
            "Taking a screen-free walk to resolve nervous loops."
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDetails();
    }
  }, [id, token, showToast]);

  // Clean up audio playback and TTS timers on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = () => {
    if (!insight) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      let textToRead = insight.summary;
      if (insight.behavioral_insight) {
        textToRead += ". " + insight.behavioral_insight;
      }

      const utterance = new SpeechSynthesisUtterance(textToRead);
      const lang = journal?.detected_language || "en";
      utterance.lang = lang;

      // Attempt to load preferred voice if voices are loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find((v) => v.lang.startsWith(lang));
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
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      showToast("Text-to-speech is not supported in this browser.", "error");
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
    }
  };

  const togglePlayback = () => {
    if (!journal?.audio_url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(journal.audio_url);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      audioRef.current.play().catch(() => {
        console.warn("Audio playback failed. Simulating seek tracking...");
      });
      setIsPlaying(true);

      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const duration = audioRef.current.duration || 10; // Default fallback to 10s if NaN
          const current = audioRef.current.currentTime;
          setPlaybackProgress((current / duration) * 100);
        } else {
          // Simulated progress increment
          setPlaybackProgress((prev) => (prev >= 100 ? 0 : prev + 2));
        }
      }, 200);
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case "calm":
        return "text-[#22D3EE]";
      case "anxious":
        return "text-[#7C3AED]";
      case "sad":
        return "text-indigo-400";
      default:
        return "text-zinc-400";
    }
  };

  const getMoodBG = (mood?: string) => {
    switch (mood) {
      case "calm":
        return "bg-[#22D3EE]/10 border-[#22D3EE]/20";
      case "anxious":
        return "bg-[#7C3AED]/10 border-[#7C3AED]/20";
      case "sad":
        return "bg-indigo-500/10 border-indigo-500/20";
      default:
        return "bg-zinc-500/10 border-zinc-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-8 select-none">
        {/* Back Button Skeleton */}
        <div className="h-4 w-28 bg-zinc-900 rounded-md animate-pulse" />
        
        {/* Header Skeleton */}
        <div className="flex justify-between items-center gap-4 animate-pulse">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-64 bg-zinc-800/40 rounded-lg" />
            <div className="h-4 w-48 bg-zinc-850/40 rounded-md" />
          </div>
          <div className="h-6 w-20 bg-zinc-850/40 rounded-full" />
        </div>

        {/* Timeline line and card skeletons */}
        <div className="pl-8 border-l border-white/5 flex flex-col gap-10 animate-pulse">
          <div className="h-20 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-32 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-28 bg-zinc-900/30 border border-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertTriangle size={32} className="mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-white">Journal Details Missing</h3>
        <p className="text-xs text-zinc-400 mt-2">Failed to load reflection entry.</p>
        <Button onClick={() => router.push("/history")} variant="secondary" className="mt-6">
          Return to History
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 select-none relative">
      {/* Background soft ambient lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/2 rounded-full blur-[100px] pointer-events-none" />

      {/* Page Header */}
      <div>
        <button
          onClick={() => router.push("/history")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft size={12} />
          <span>Back to history</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{journal.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-zinc-400 text-xs font-light">
              <Calendar size={13} className="text-zinc-500" />
              <span>
                {new Date(journal.created_at).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          
          <span className={`self-start md:self-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getMoodBG(journal.mood)} ${getMoodColor(journal.mood)}`}>
            {journal.mood}
          </span>
        </div>
      </div>

      {/* Main timeline container */}
      <div className="relative pl-6 md:pl-8 border-l border-white/5 flex flex-col gap-10">
        
        {/* Timeline item 1: Audio Playback */}
        {journal.audio_url && (
          <div className="relative">
            {/* Timeline Circle pin */}
            <div className="absolute -left-[31px] md:-left-[39px] w-6 h-6 rounded-full bg-zinc-950 border-2 border-white/10 flex items-center justify-center text-zinc-500">
              <Volume2 size={12} />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                Step 1: Audio Recording File
              </span>
              
              <Card className="p-4 w-full max-w-md flex items-center gap-4 border-white/5 bg-zinc-900/60">
                <button
                  onClick={togglePlayback}
                  className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 flex items-center justify-center cursor-pointer text-primary transition-colors shrink-0"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-semibold text-white truncate">Voice Journal Clip</span>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-200"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Timeline item 2: Text Transcript */}
        {journal.transcript && (
          <div className="relative">
            <div className="absolute -left-[31px] md:-left-[39px] w-6 h-6 rounded-full bg-zinc-950 border-2 border-white/10 flex items-center justify-center text-zinc-500">
              <Languages size={12} />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                  Step 2: Vocal Transcription
                </span>
                {journal.confidence_score !== undefined && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Acc: {Math.round(journal.confidence_score * 100)}% ({journal.detected_language || "en"})
                  </span>
                )}
              </div>
              <Card className="p-5 border-white/5 bg-[#18181B]/40">
                <p className="text-zinc-300 text-sm font-light leading-relaxed whitespace-pre-line italic">
                  &ldquo;{journal.transcript}&rdquo;
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Timeline item 3: AI Cognitive Summary */}
        {insight && (
          <div className="relative">
            <div className="absolute -left-[31px] md:-left-[39px] w-6 h-6 rounded-full bg-zinc-950 border-2 border-accent/20 flex items-center justify-center text-accent">
              <Sparkles size={12} />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                Step 3: Cognitive Summary & AI Observation
              </span>
              <Card className="p-5 border-white/5 bg-gradient-to-br from-[#18181B]/80 to-[#0F0F11]/80 flex flex-col gap-4">
                <p className="text-zinc-200 text-sm font-light leading-relaxed">
                  {insight.summary}
                </p>
                
                {insight.behavioral_insight && (
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-start gap-3">
                    <BrainCircuit size={16} className="text-primary shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider">Behavioral Observation Pattern</span>
                      <p className="text-xs text-zinc-300 font-light leading-relaxed">{insight.behavioral_insight}</p>
                      <span className="text-[8px] text-zinc-500 font-light italic mt-1">*Cognitive behavior mapping. Not medical advice.</span>
                    </div>
                  </div>
                )}
              </Card>

              {/* TTS Controls */}
              <div className="flex items-center gap-2 mt-1">
                {!isSpeaking ? (
                  <Button variant="secondary" onClick={handleReadAloud} className="flex items-center gap-2 text-xs h-8">
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
          </div>
        )}

        {/* Timeline item 4: Emotional & Energetic baseline */}
        {insight && (
          <div className="relative">
            <div className="absolute -left-[31px] md:-left-[39px] w-6 h-6 rounded-full bg-zinc-950 border-2 border-white/10 flex items-center justify-center text-zinc-500">
              <Smile size={12} />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                Step 4: Emotional & Energetic baselines
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-white/5 flex flex-col gap-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp size={11} className="text-red-400" /> Stress Index
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/80" style={{ width: `${(insight.stress_level || 5) * 10}%` }} />
                    </div>
                    <span className="text-xs font-mono text-zinc-300">{insight.stress_level || 5}/10</span>
                  </div>
                </Card>

                <Card className="p-4 border-white/5 flex flex-col gap-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Award size={11} className="text-emerald-400" /> Confidence Index
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/80" style={{ width: `${(insight.confidence_level || 5) * 10}%` }} />
                    </div>
                    <span className="text-xs font-mono text-zinc-300">{insight.confidence_level || 5}/10</span>
                  </div>
                </Card>

                <Card className="p-4 border-white/5 flex flex-col gap-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap size={11} className="text-amber-400" /> Energy Index
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/80" style={{ width: `${(insight.energy_level || 5) * 10}%` }} />
                    </div>
                    <span className="text-xs font-mono text-zinc-400">{insight.energy_level || 5}/10</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Timeline item 5: Distortion Diagnostics & Topics */}
        {insight && (
          <div className="relative">
            <div className="absolute -left-[31px] md:-left-[39px] w-6 h-6 rounded-full bg-zinc-950 border-2 border-white/10 flex items-center justify-center text-zinc-500">
              <AlertTriangle size={12} />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                Step 5: Cognitive Distortions & Topics
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 border-white/5 flex flex-col gap-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Cognitive Distortions Mapped</span>
                  {insight.cognitive_distortions && insight.cognitive_distortions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {insight.cognitive_distortions.map((d) => (
                        <span key={d} className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                          {d}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic mt-1">No cognitive distortions flagged. Excellent structural logic!</span>
                  )}
                </Card>

                <Card className="p-5 border-white/5 flex flex-col gap-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Primary Subjects discussed</span>
                  {insight.topics && insight.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {insight.topics.map((t) => (
                        <span key={t} className="text-[10px] text-zinc-300 bg-white/4 border border-white/5 px-2.5 py-1 rounded-lg">
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic mt-1">No major topics indexed.</span>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Timeline item 6: Comparison and Action plan */}
        {insight && (
          <div className="relative">
            <div className="absolute -left-[31px] md:-left-[39px] w-6 h-6 rounded-full bg-zinc-950 border-2 border-primary/20 flex items-center justify-center text-primary">
              <BrainCircuit size={12} />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                Step 6: Comparative Mapping & Action Prompts
              </span>
              
              <div className="flex flex-col gap-4">
                {/* Similarity map */}
                {insight.similar_journal_id && (
                  <Card className="p-5 border-white/5 bg-[#18181B]/20 flex flex-col gap-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Historical Pattern Similarity Link</span>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">
                      {insight.similarity_explanation}
                    </p>
                    {insight.previously_helpful_actions && insight.previously_helpful_actions.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#22D3EE] select-none block">
                          ⚡ Historically Resolving Behaviors
                        </span>
                        <div className="flex flex-col gap-1">
                          {insight.previously_helpful_actions.map((act, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-[#FAFAFA] font-light">
                              <span className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Actions Checklist */}
                {insight.action_items && insight.action_items.length > 0 && (
                  <Card className="p-5 border-white/5 flex flex-col gap-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Suggested Reframing Actions</span>
                    <div className="flex flex-col gap-2 mt-1">
                      {insight.action_items.map((act, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/2 border border-white/4 p-3 rounded-xl">
                          <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-xs text-zinc-300 font-light leading-relaxed">{act}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}



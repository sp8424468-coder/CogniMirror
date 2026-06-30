"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Mic,
  Calendar,
  Sparkles,
  ArrowRight,
  Smile,
  AlertCircle,
  BrainCircuit,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";

interface Journal {
  id: string;
  title: string;
  mood: string;
  created_at: string;
  transcript?: string;
}

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

interface DashboardStats {
  total_entries: number;
  weekly_reflection: string;
  mood_distribution: Record<string, number>;
  common_distortions: string[];
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latestInsight, setLatestInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/insights/stats`, { headers });
        let statsData: DashboardStats;
        if (statsRes.ok) {
          statsData = await statsRes.json();
        } else {
          throw new Error("Stats request failed");
        }

        // Fetch Journals
        const journalsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/journals/?limit=3`, { headers });
        let journalsData: Journal[];
        if (journalsRes.ok) {
          journalsData = await journalsRes.json();
        } else {
          throw new Error("Journals request failed");
        }

        // Fetch Latest Insight
        const insightsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/insights/?limit=1`, { headers });
        let latestInsightData: Insight | null = null;
        if (insightsRes.ok) {
          const insightsList = await insightsRes.json();
          if (insightsList && insightsList.length > 0) {
            latestInsightData = insightsList[0];
          }
        }

        setStats(statsData);
        setJournals(journalsData);
        setLatestInsight(latestInsightData);
      } catch (error) {
        console.warn("Backend offline, loading mock dashboard statistics...", error);
        showToast("CogniMirror backend offline. Simulating profile locally.", "info");
        
        // Mock fallback statistics data
        setStats({
          total_entries: 3,
          weekly_reflection:
            "You have logged 3 reflections this week. WORKLOAD pressure was detected early, followed by resilient reframing.",
          mood_distribution: { calm: 1, anxious: 1, sad: 0, neutral: 1 },
          common_distortions: ["Catastrophizing", "All-or-Nothing Thinking"],
        });

        // Mock recent journals data
        setJournals([
          {
            id: "j_1",
            title: "Dealing with deadline pressure",
            mood: "anxious",
            created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            transcript: "I feel overwhelmed with the upcoming roadmap push. There is so much to coordinate..."
          },
          {
            id: "j_2",
            title: "Morning reflection on calm walk",
            mood: "calm",
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            transcript: "The weather was beautiful. Took a deep breath and reminded myself to focus on what is in control."
          },
          {
            id: "j_3",
            title: "Evening review and thoughts",
            mood: "neutral",
            created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            transcript: "Pretty standard day. Wrapped up core configurations. Ready to continue tomorrow."
          },
        ]);

        // Mock latest insight
        setLatestInsight({
          id: "ins_1",
          summary: "You are experiencing deadline stress and catastrophizing your workload delivery. Reminding yourself of past deployment success will rebuild self-worth.",
          primary_emotion: "anxious",
          emotion_score: 0.85,
          stress_level: 7,
          confidence_level: 4,
          energy_level: 6,
          topics: ["milestones", "deployments", "overwork"],
          cognitive_distortions: ["Catastrophizing", "All-or-Nothing Thinking"],
          action_items: [
            "Break task X down into small 10-minute intervals.",
            "Take 5 slow breaths, focusing on relaxing your shoulder muscles."
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, showToast]);

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case "calm":
        return "text-[#22D3EE]"; // Accent Cyan
      case "anxious":
        return "text-[#7C3AED]"; // Primary Violet
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

  const currentMood = latestInsight?.primary_emotion || journals[0]?.mood || "neutral";

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-8 select-none">
        {/* Banner Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-52 bg-zinc-800/40 rounded-lg animate-pulse" />
            <div className="h-4 w-80 bg-zinc-850/40 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-zinc-850/40 rounded-xl animate-pulse" />
        </div>
        
        {/* Banner Card Skeleton */}
        <div className="h-28 w-full bg-zinc-900/30 border border-white/5 rounded-2xl p-5 flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 w-32 bg-zinc-800/50 rounded-md" />
            <div className="h-4 w-3/4 bg-zinc-800/50 rounded-md" />
            <div className="h-3 w-48 bg-zinc-900/50 rounded-md" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-80 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="lg:col-span-2 h-80 bg-zinc-900/30 border border-white/5 rounded-2xl" />
        </div>

        {/* List Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="h-4 w-32 bg-zinc-900/50 rounded-md" />
            <div className="h-16 bg-zinc-900/30 border border-white/5 rounded-2xl" />
            <div className="h-16 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          </div>
          <div className="h-48 bg-zinc-900/30 border border-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 select-none">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.full_name?.split(" ")[0] || "Alexander"}
          </h1>
          <p className="text-zinc-400 text-sm font-light mt-1">
            Review your cognitive status and core reflection statistics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold bg-white/3 border border-white/5 px-4 py-2.5 rounded-xl">
          <Calendar size={14} className="text-zinc-500" />
          <span>Session: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* AI Observation Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-zinc-900 border-primary/20 p-5 relative overflow-hidden" glow="primary">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 select-none">
            <BrainCircuit size={18} className="animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 select-none">
              <span className="text-xs font-bold tracking-widest text-[#22D3EE] uppercase">AI Behavioral Observation</span>
              <span className="text-[8px] bg-white/5 text-zinc-500 border border-white/5 px-2 py-0.5 rounded-sm uppercase tracking-wide font-medium">Cognitive Companion</span>
            </div>
            <p className="text-zinc-200 text-sm leading-relaxed font-light font-sans whitespace-pre-line">
              {latestInsight?.behavioral_insight || "Record your reflections. The AI companion analyzes trends over time to trace recurring cognitive habits."}
            </p>
            <span className="text-[9px] text-zinc-500 font-light italic select-none mt-1">
              *Disclaimer: This is a behavioral observation of journal patterns and is not intended as medical advice.
            </span>
          </div>
        </div>
      </Card>

      {/* Grid Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Mood Card */}
        <Card className="flex flex-col justify-between gap-6" glow={currentMood === "anxious" ? "primary" : currentMood === "calm" ? "accent" : "none"}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Mental State baseline
              </span>
              <Smile size={18} className={getMoodColor(currentMood)} />
            </div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight uppercase">
              {currentMood}
            </h3>
            <p className="text-zinc-400 text-xs font-light mt-2 leading-relaxed">
              Mapped from your most recent voice reflection journal entry.
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${getMoodBG(currentMood)}`}>
            <span className="text-xs font-semibold text-zinc-300">Active distortion:</span>
            <span className="text-xs font-bold block mt-1 text-[#FAFAFA]">
              {latestInsight?.cognitive_distortions && latestInsight.cognitive_distortions.length > 0 
                ? latestInsight.cognitive_distortions[0] 
                : stats?.common_distortions[0] || "None detected"}
            </span>
          </div>
        </Card>

        {/* Live Insight / Weekly Reflection Card */}
        {latestInsight ? (
          <Card className="lg:col-span-2 flex flex-col gap-6 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent animate-pulse" />
                  <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                    Latest Cognitive Analysis Synthesis
                  </span>
                </div>
                {latestInsight.primary_emotion && (
                  <span className="text-[9px] font-bold text-accent bg-accent/10 border border-accent/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {latestInsight.primary_emotion} ({latestInsight.emotion_score ? Math.round(latestInsight.emotion_score * 100) : 50}% intensity)
                  </span>
                )}
              </div>
              
              <p className="text-zinc-300 text-sm leading-relaxed font-light">
                {latestInsight.summary}
              </p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-white/5 py-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={10} className="text-red-400" /> Stress
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500/80" style={{ width: `${(latestInsight.stress_level || 5) * 10}%` }} />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 shrink-0">{latestInsight.stress_level || 5}/10</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award size={10} className="text-emerald-400" /> Confidence
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/80" style={{ width: `${(latestInsight.confidence_level || 5) * 10}%` }} />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 shrink-0">{latestInsight.confidence_level || 5}/10</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Zap size={10} className="text-amber-400" /> Energy
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500/80" style={{ width: `${(latestInsight.energy_level || 5) * 10}%` }} />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 shrink-0">{latestInsight.energy_level || 5}/10</span>
                </div>
              </div>
            </div>

            {/* Topics & Action items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestInsight.topics && latestInsight.topics.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Central Topics</span>
                  <div className="flex flex-wrap gap-1.5">
                    {latestInsight.topics.map((t) => (
                      <span key={t} className="text-[10px] bg-white/4 border border-white/5 text-zinc-300 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {latestInsight.action_items && latestInsight.action_items.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Guided Action Plan</span>
                  <div className="flex flex-col gap-1.5">
                    {latestInsight.action_items.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 font-light leading-relaxed">
                        <span className="text-accent font-bold select-none">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mood Similarity Comparison Section */}
            {latestInsight.similar_journal_id && (
              <div className="border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-2 select-none">
                  <BrainCircuit size={13} className="text-primary animate-pulse" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Comparative Reflection Mapping</span>
                </div>
                <div className="bg-[#18181B]/50 border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    <span className="font-semibold text-white">Pattern Similarity:</span> {latestInsight.similarity_explanation}
                  </p>
                  
                  {latestInsight.previously_helpful_actions && latestInsight.previously_helpful_actions.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#22D3EE] flex items-center gap-1 select-none">
                        ⚡ Historically Resolving Behaviors
                      </span>
                      <div className="flex flex-col gap-1">
                        {latestInsight.previously_helpful_actions.map((act, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#FAFAFA] font-light">
                            <span className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="lg:col-span-2 flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-accent animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Weekly Reflective Synthesis
                </span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed font-light font-sans">
                &ldquo;{stats?.weekly_reflection}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">
                Cognitive Companion Guidance
              </span>
              <Link href="/insights" className="text-xs text-accent hover:text-accent/80 font-medium inline-flex items-center gap-1 transition-colors">
                <span>View full patterns</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Second Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Journals */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Recent journals
            </span>
            <Link href="/history" className="text-xs text-zinc-400 hover:text-[#FAFAFA] font-medium transition-colors">
              View all log entries
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {journals.length === 0 ? (
              <Card className="text-center py-8">
                <AlertCircle className="mx-auto text-zinc-500 mb-2" size={20} />
                <span className="text-xs text-zinc-400 font-light block">
                  No journals registered yet.
                </span>
              </Card>
            ) : (
              journals.map((journal) => (
                <Card
                  key={journal.id}
                  hoverable
                  onClick={() => router.push(`/history/${journal.id}`)}
                  className="p-4 flex items-center justify-between gap-4 border-white/5 hover:border-primary/20"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${getMoodBG(journal.mood)} flex items-center justify-center shrink-0`}>
                      <Mic size={14} className={getMoodColor(journal.mood)} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {journal.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {new Date(journal.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs shrink-0 select-none">
                    <ArrowRight size={14} />
                  </span>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Start / Analytical trend box */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Reflection Shortcut
          </span>

          <Card className="flex-1 bg-gradient-to-br from-[#18181B] to-[#0C0C0E] border-white/5 flex flex-col justify-between p-6 relative overflow-hidden">
            {/* Visual Grid indicator */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(124,58,237,0.06)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 neon-glow-primary">
                <BrainCircuit size={18} />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                Daily Voice Reflection
              </h4>
              <p className="text-zinc-400 text-xs font-light mt-1.5 leading-relaxed">
                Unlock deeper insights. Speaking out loud engages cognitive alignment pipelines instantly.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => router.push("/voice")}
              className="w-full flex items-center justify-center gap-2 mt-6 relative z-10"
            >
              <Mic size={16} />
              <span>Record Reflection</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import {
  TrendingUp,
  Brain,
  Layers,
  Sparkles,
  Target,
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
  created_at: string;
}

interface Stats {
  total_entries: number;
  weekly_reflection: string;
  mood_distribution: Record<string, number>;
  common_distortions: string[];
}

export default function WeeklyReflectionPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch general stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/insights/stats`, { headers });
        let statsData: Stats;
        if (statsRes.ok) {
          statsData = await statsRes.json();
        } else {
          throw new Error("Stats request failed");
        }

        // Fetch last 7 insights for trend charting
        const insightsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/insights/?limit=7`, { headers });
        let insightsList: Insight[] = [];
        if (insightsRes.ok) {
          insightsList = await insightsRes.json();
        }

        setStats(statsData);
        // Reverse list to show chronologically (oldest to newest) on charts
        setInsights(insightsList.reverse());
      } catch (err) {
        console.warn("Backend offline, loading mock weekly reflection details...", err);
        showToast("Backend connection issue. Loading offline weekly reflections dashboard.", "info");
        
        // Mock general statistics
        setStats({
          total_entries: 5,
          weekly_reflection:
            "Your emotional waves suggest localized anxiety patterns around mid-week schedules, tapering off towards positive calm on weekends. The main cognitive pattern remains catastrophizing (anticipating negative outcomes).",
          mood_distribution: { calm: 2, anxious: 2, sad: 0, neutral: 1 },
          common_distortions: ["Catastrophizing", "Should Statements"],
        });

        // Mock historical trend insights (7 logs)
        setInsights([
          {
            id: "i_1",
            summary: "Workload stress mapping",
            primary_emotion: "anxious",
            stress_level: 8,
            confidence_level: 3,
            energy_level: 5,
            topics: ["deadlines", "dependencies"],
            cognitive_distortions: ["Catastrophizing"],
            created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
          },
          {
            id: "i_2",
            summary: "Neutral review",
            primary_emotion: "neutral",
            stress_level: 5,
            confidence_level: 5,
            energy_level: 5,
            topics: ["routine"],
            cognitive_distortions: ["Should Statements"],
            created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          },
          {
            id: "i_3",
            summary: "Calm walk reflections",
            primary_emotion: "calm",
            stress_level: 3,
            confidence_level: 7,
            energy_level: 6,
            topics: ["resilience", "mindfulness"],
            cognitive_distortions: [],
            created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          },
          {
            id: "i_4",
            summary: "Roadmap scheduling blocks",
            primary_emotion: "anxious",
            stress_level: 7,
            confidence_level: 4,
            energy_level: 7,
            topics: ["milestones", "overwork"],
            cognitive_distortions: ["Catastrophizing"],
            created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          },
          {
            id: "i_5",
            summary: "Calm evening reframing success",
            primary_emotion: "calm",
            stress_level: 2,
            confidence_level: 8,
            energy_level: 5,
            topics: ["breathing", "rest"],
            cognitive_distortions: [],
            created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, showToast]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8 select-none">
        <div>
          <div className="h-7 w-48 bg-zinc-800/40 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-zinc-850/40 rounded-lg animate-pulse" />
        </div>
        
        {/* Stats Summary Panel Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-20 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-20 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-20 bg-zinc-900/30 border border-white/5 rounded-2xl" />
        </div>

        {/* Row 2: Charts and Topics Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-72 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-72 bg-zinc-900/30 border border-white/5 rounded-2xl" />
        </div>

        {/* Row 3: Growth and Recommended Focus Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-36 bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-36 bg-zinc-900/30 border border-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Compile Recurring Topics frequencies
  const topicCounts: Record<string, number> = {};
  insights.forEach((ins) => {
    (ins.topics || []).forEach((t) => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });
  const recurringTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Compile growth summary analysis
  const computeGrowthSummary = () => {
    if (insights.length < 2) {
      return "Log multiple reflections to allow our cognitive engine to trace behavioral growths over time.";
    }
    const firstStress = insights[0].stress_level || 5;
    const lastStress = insights[insights.length - 1].stress_level || 5;
    const firstConf = insights[0].confidence_level || 5;
    const lastConf = insights[insights.length - 1].confidence_level || 5;

    if (lastStress < firstStress && lastConf > firstConf) {
      return "Your cognitive charts display highly positive growth. Your stress indices have gradually decreased while your confidence baselines shifted upwards, demonstrating successful behavior reframing.";
    } else if (lastStress > firstStress) {
      return "Your logs register a moderate increase in stress pressure this week. This is typically linked to schedule commitments; focusing on task delegation will ease nervous cycles.";
    } else {
      return "Your cognitive baseline is tracking stable. You are processing daily workload with relative objective mindfulness and emotional balance.";
    }
  };

  // Recommended next week focus based on distortions
  const getNextWeekFocus = () => {
    const primaryDistortion = stats?.common_distortions[0] || "None Mapped";
    if (primaryDistortion === "Catastrophizing") {
      return {
        title: "Outcome Probability Balancing",
        guide: "Practice writing down the worst outcome, the best outcome, and the most realistic outcome. Focus next week on circling the middle ground.",
      };
    } else if (primaryDistortion === "Should Statements") {
      return {
        title: "Flexible Rule Exploration",
        guide: "Notice whenever you tell yourself 'I should' or 'I must' do Y. Practice swapping these terms with 'I would prefer to' or 'It is okay if I don't Y today'.",
      };
    } else {
      return {
        title: "Somatic Grounding Practices",
        guide: "Practice daily 4-7-8 breathing blocks during high-stress scheduling intervals to reframe somatic triggers cleanly.",
      };
    }
  };

  const nextFocus = getNextWeekFocus();

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 select-none relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/2 rounded-full blur-[100px] pointer-events-none" />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Weekly Reflection</h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Review emotional trends, topics discussed, and structural growths computed from your logs.
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reflections Analyzed</span>
            <h3 className="text-xl font-bold text-white mt-1">{stats?.total_entries} Logs</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dominant State</span>
            <h3 className="text-xl font-bold text-white mt-1 uppercase">
              {insights[insights.length - 1]?.primary_emotion || "Reflective"}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Distortion</span>
            <h3 className="text-xl font-bold text-white mt-1 truncate max-w-[180px]">
              {stats?.common_distortions[0] || "None flagged"}
            </h3>
          </div>
        </Card>
      </div>

      {/* Row 2: Charts and Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stress vs Confidence custom SVG Graph */}
        <Card className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Stress vs Confidence Trend</span>
            <p className="text-zinc-400 text-xs font-light mt-1">Comparing stress indices (red) against confidence baselines (emerald).</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {insights.length < 2 ? (
              <span className="text-xs text-zinc-500 italic">Not enough historical trend points. Log entries to plot.</span>
            ) : (
              <svg viewBox="0 0 500 200" className="w-full h-full text-zinc-800">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Draw Stress Line */}
                <path
                  d={insights
                    .map((ins, idx) => {
                      const x = (idx / (insights.length - 1)) * 500;
                      const y = 200 - (ins.stress_level || 5) * 18 - 10;
                      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                
                {/* Draw Confidence Line */}
                <path
                  d={insights
                    .map((ins, idx) => {
                      const x = (idx / (insights.length - 1)) * 500;
                      const y = 200 - (ins.confidence_level || 5) * 18 - 10;
                      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Draw data point circles */}
                {insights.map((ins, idx) => {
                  const x = (idx / (insights.length - 1)) * 500;
                  const stressY = 200 - (ins.stress_level || 5) * 18 - 10;
                  const confY = 200 - (ins.confidence_level || 5) * 18 - 10;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={stressY} r="4" fill="#EF4444" />
                      <circle cx={x} cy={confY} r="4" fill="#10B981" />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
            {insights.map((ins, idx) => (
              <span key={idx}>Log {idx + 1}</span>
            ))}
          </div>
        </Card>

        {/* Recurring Topics list */}
        <Card className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Recurring Topics</span>
            <p className="text-zinc-400 text-xs font-light mt-1">Subjects occurring most frequently in reflections.</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {recurringTopics.length === 0 ? (
              <span className="text-xs text-zinc-500 italic">No topics indexed yet.</span>
            ) : (
              recurringTopics.map(([topic, count], idx) => (
                <div key={topic} className="flex items-center justify-between bg-[#18181B]/50 border border-white/5 p-3 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-accent select-none">#{idx + 1}</span>
                    <span className="text-xs text-[#FAFAFA] font-medium truncate">#{topic}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">{count} occurrences</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Growth and Recommended Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth summary */}
        <Card className="lg:col-span-2 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">AI Behavioral Growth Analysis</span>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed font-light">
            {computeGrowthSummary()}
          </p>

          <span className="text-[9px] text-zinc-500 font-light mt-4 select-none uppercase tracking-widest">
            Cognitive companion synthesis
          </span>
        </Card>

        {/* Recommended focus card */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10 flex flex-col gap-5 justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#22D3EE]" />
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Focus for Next Week</span>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-base font-bold text-white tracking-tight">{nextFocus.title}</h4>
            <p className="text-zinc-300 text-xs font-light leading-relaxed">{nextFocus.guide}</p>
          </div>

          <span className="text-[9px] text-zinc-500 font-light italic mt-3 select-none">
            *Behavior reframing target. Not clinical advice.
          </span>
        </Card>
      </div>
    </div>
  );
}

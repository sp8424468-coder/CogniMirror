"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Calendar,
  Smile,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Brain,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
  summary: string;
  emotion_details: Record<string, number>;
  cognitive_patterns: string[];
  actionable_reflections: string[];
}

interface Journal {
  id: string;
  title: string;
  transcript: string;
  detected_language: string;
  mood: string;
  created_at: string;
  insight?: Insight;
}

export default function HistoryPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/journals/`, { headers });
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        
        // Fetch insights for each journal to populate details
        const journalsWithInsights = await Promise.all(
          data.map(async (j: Journal) => {
            try {
              const insRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/insights/journal/${j.id}`, { headers });
              if (insRes.ok) {
                const insData = await insRes.json();
                j.insight = insData;
              }
            } catch {
              // Ignore single insight fail
            }
            return j;
          })
        );
        
        setJournals(journalsWithInsights);
      } catch {
        console.warn("Backend offline. Setting up local historical logs...");
        showToast("Backend connection issue. Loading offline reflection timelines.", "info");
        setJournals([
          {
            id: "j_1",
            title: "Dealing with deadline pressure",
            transcript: "I feel overwhelmed with the upcoming roadmap push. There is so much to coordinate. If we miss the deadline, everything might collapse, and I will be blamed.",
            detected_language: "en",
            mood: "anxious",
            created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            insight: {
              summary: "You are experiencing elevated anxiety concerning deliverables and showing catastrophizing and personalization loops.",
              emotion_details: { joy: 0.05, anxiety: 0.70, sadness: 0.15, calm: 0.10 },
              cognitive_patterns: ["Catastrophizing", "Personalization"],
              actionable_reflections: [
                "Outline tasks that are strictly under your control versus dependencies.",
                "Challenge the catastrophizing thought: what is the most realistic outcome?"
              ]
            }
          },
          {
            id: "j_2",
            title: "Morning reflection on calm walk",
            transcript: "The weather was beautiful. Took a deep breath and reminded myself to focus on what is in control. I feel ready to handle things calmly.",
            detected_language: "en",
            mood: "calm",
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            insight: {
              summary: "You expressed stable positive sentiments, self-validation, and high presence.",
              emotion_details: { joy: 0.50, anxiety: 0.10, sadness: 0.05, calm: 0.35 },
              cognitive_patterns: [],
              actionable_reflections: [
                "Write down what key environment triggers helped establish this calm baseline."
              ]
            }
          },
          {
            id: "j_3",
            title: "Evening review and thoughts",
            transcript: "Pretty standard day. Wrapped up core configurations. Ready to continue tomorrow. I should have worked faster though.",
            detected_language: "en",
            mood: "neutral",
            created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            insight: {
              summary: "Neutral objective logs, with subtle self-imposed expectations of performance.",
              emotion_details: { joy: 0.20, anxiety: 0.20, sadness: 0.20, calm: 0.40 },
              cognitive_patterns: ["Should Statements"],
              actionable_reflections: [
                "Observe if 'Should' requirements are self-critical versus truly constructive."
              ]
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchJournals();
    }
  }, [token, showToast]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/journals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setJournals(journals.filter((j) => j.id !== id));
      }
    } catch {
      // Offline fallback
      setJournals(journals.filter((j) => j.id !== id));
    }
  };

  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.mood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMoodColor = (mood: string) => {
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

  const getMoodBG = (mood: string) => {
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

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reflection Logs</h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Review, search, and map previous voice diaries and their associated cognitive charts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-zinc-500" size={16} />
        <input
          type="text"
          className="w-full bg-[#18181B]/80 text-[#FAFAFA] border border-white/8 rounded-xl pl-11 pr-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-hidden focus:border-primary/50"
          placeholder="Search by keywords, transcript content, or emotional state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-16 w-full bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-16 w-full bg-zinc-900/30 border border-white/5 rounded-2xl" />
          <div className="h-16 w-full bg-zinc-900/30 border border-white/5 rounded-2xl" />
        </div>
      ) : filteredJournals.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-zinc-500 text-sm font-light block">
            No reflections found matching search criteria.
          </span>
        </Card>
      ) : (
        /* Timeline flow */
        <div className="flex flex-col gap-4">
          {filteredJournals.map((journal) => {
            const isExpanded = expandedId === journal.id;
            return (
              <Card
                key={journal.id}
                className={`transition-all duration-300 border-white/5 cursor-pointer relative overflow-hidden ${
                  isExpanded ? "border-primary/20" : "hover:border-zinc-800"
                }`}
                onClick={() => setExpandedId(isExpanded ? null : journal.id)}
              >
                {/* Collapsed Header state */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg ${getMoodBG(journal.mood)} flex items-center justify-center shrink-0`}>
                      <Smile size={14} className={getMoodColor(journal.mood)} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-wide">
                        {journal.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                        <Calendar size={10} />
                        <span>
                          {new Date(journal.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{journal.mood} state</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto md:ml-0">
                    <button
                      onClick={(e) => handleDelete(e, journal.id)}
                      className="p-2 rounded-lg bg-transparent hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 size={13} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                  </div>
                </div>

                {/* Expanded Details frame */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 mt-6 pt-6 flex flex-col gap-6">
                        {/* Transcript section */}
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase block mb-2">
                            Transcript Translation
                          </span>
                          <p className="text-zinc-300 text-xs leading-relaxed font-light bg-white/2 p-3.5 rounded-xl border border-white/5">
                            {journal.transcript}
                          </p>
                        </div>

                        {/* Cognitive insight block if exists */}
                        {journal.insight && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Summary & distortion labels */}
                            <div className="flex flex-col gap-4">
                              <div>
                                <span className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase block mb-1.5">
                                  Cognitive Synthesis
                                </span>
                                <p className="text-zinc-300 text-xs leading-relaxed font-light">
                                  {journal.insight.summary}
                                </p>
                              </div>

                              {journal.insight.cognitive_patterns.length > 0 && (
                                <div>
                                  <span className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase block mb-2">
                                    Detected Patterns
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {journal.insight.cognitive_patterns.map((pat) => (
                                      <span
                                        key={pat}
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[#FAFAFA]"
                                      >
                                        <AlertTriangle size={10} className="text-primary" />
                                        <span>{pat}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Reflection list */}
                            <div className="p-4 rounded-2xl bg-[#09090B]/60 border border-white/5">
                              <span className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase block mb-3">
                                Actionable Reflections
                              </span>
                              <ul className="flex flex-col gap-2.5">
                                {journal.insight.actionable_reflections.map((ref, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-light">
                                    <Brain size={12} className="text-accent shrink-0 mt-0.5" />
                                    <span>{ref}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Open standalone timeline details */}
                        <div className="flex justify-end border-t border-white/5 pt-4">
                          <Button
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/history/${journal.id}`);
                            }}
                            className="text-xs flex items-center gap-1.5 py-1.5 h-auto cursor-pointer"
                          >
                            <span>Open Cognitive Timeline</span>
                            <ArrowRight size={12} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

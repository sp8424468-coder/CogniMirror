"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Brain,
  Languages,
  Sparkles,
  ArrowRight,
  Smile,
  Activity,
  Play,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RedesignedLandingPage() {
  const [activeTab, setActiveTab] = useState<"stt" | "analysis" | "insights">("stt");

  // Framer Motion Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: custom * 0.12,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const tabContent = {
    stt: {
      title: "Sarvam Multi-Dialect STT",
      tagline: "Natural dialect capture with native precision",
      desc: "Speak naturally in your mother tongue. CogniMirror transcribes local languages and subtle dialects, maintaining the precise context and emotional weight of your raw verbal thoughts.",
      metrics: ["98.2% Dialect Accuracy", "Under 1.2s Transcription Latency", "Multi-speaker diarization ready"],
    },
    analysis: {
      title: "Gemini Flash Cognitive Parsing",
      tagline: "Uncover logical distortions in real-time",
      desc: "Our analysis engine maps transcripts to trace key cognitive distortions—such as catastrophizing, personalization, and emotional reasoning—flagging repetitive mental locks.",
      metrics: ["12 Cognitive distortions tracked", "Context-aware sentiment indexing", "Immediate distortion tag overlays"],
    },
    insights: {
      title: "Emotional Baseline Trends",
      tagline: "Transform text reflection logs into structured wellness maps",
      desc: "Aggregate daily mental state baselines into interactive wellness summaries, delivering actionable reframing exercises to help manage behavioral patterns.",
      metrics: ["Weekly distortion weight ratios", "Actionable reflection prompts", "Visual emotional swings tracking"],
    },
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-primary selection:text-white relative overflow-x-hidden">
      {/* Animated breathing gradient background overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] pointer-events-none overflow-hidden -z-10 select-none">
        {/* Soft Violet Sphere */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: ["-5%", "5%", "-5%"],
            y: ["-5%", "5%", "-5%"],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]"
        />
        {/* Soft Cyan Sphere */}
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: ["5%", "-5%", "5%"],
            y: ["5%", "-5%", "5%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-accent/8-z rounded-full blur-[120px]"
        />
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:24px_24px] mask-image-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      {/* Glassmorphism Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090B]/60 backdrop-blur-md px-8 py-3.5 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2 select-none cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center neon-glow-primary shrink-0">
            <span className="text-sm font-black text-white">CM</span>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CogniMirror
          </span>
        </div>

        {/* Center navigation links - Linear inspired styling */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400 select-none">
          <span className="hover:text-white transition-colors cursor-pointer relative py-1 group">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-accent group-hover:w-full transition-all duration-300" />
          </span>
          <span className="hover:text-white transition-colors cursor-pointer relative py-1 group">
            Methodology
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-accent group-hover:w-full transition-all duration-300" />
          </span>
          <span className="hover:text-white transition-colors cursor-pointer relative py-1 group">
            Pricing
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-accent group-hover:w-full transition-all duration-300" />
          </span>
          <span className="hover:text-white transition-colors cursor-pointer relative py-1 group">
            Docs
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-accent group-hover:w-full transition-all duration-300" />
          </span>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
              <span>Start Free</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 pt-20 pb-28 flex flex-col items-center text-center max-w-7xl mx-auto relative">
        {/* Glow badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/5 mb-6 select-none relative"
        >
          <span className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
          <Sparkles size={11} className="text-accent" />
          <span className="text-[10px] font-semibold text-accent tracking-wider uppercase">
            CogniMirror Companion v1.0
          </span>
        </motion.div>

        {/* Premium Typography Heading */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="text-5xl md:text-8xl font-black tracking-tight leading-[0.98] max-w-5xl mb-6 bg-gradient-to-b from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent uppercase select-none"
        >
          Understand what<br />your voice hides.
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="text-zinc-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-light select-none"
        >
          A voice-first AI cognitive companion. Record verbal reflections naturally in any dialect. Map recurring emotional distortions, challenge blind spots, and realign your baseline.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="flex flex-col sm:flex-row gap-4 mb-20 relative z-10"
        >
          <Link href="/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 text-sm shadow-[0_0_25px_rgba(124,58,237,0.3)]">
              <span>Start Free Sandbox</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 border-white/8 hover:bg-white/3 text-sm flex items-center justify-center"
            >
              <Play size={14} className="text-zinc-400 group-hover:text-white" />
              <span>Watch Demo</span>
            </Button>
          </Link>
        </motion.div>

        {/* Perspective Dashboard Mockup Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl rounded-3xl border border-white/5 p-4 bg-[#0C0C0E]/40 backdrop-blur-xl relative overflow-hidden select-none"
          style={{ perspective: 1200 }}
        >
          {/* Subtle Radial Glow on the Mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-accent/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="rounded-2xl border border-white/5 bg-[#09090B]/60 p-6 flex flex-col md:flex-row gap-6 relative z-10 text-left">
            {/* Left Mock Panel */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Real-time Vocal Stream
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">00:42 SEC</span>
              </div>

              {/* Soundwaves SVG Mock */}
              <div className="h-16 flex items-center gap-1">
                {[15, 28, 40, 47, 50, 46, 36, 23, 11, 4, 3, 9, 20, 33, 44, 49, 49, 41, 29, 16, 6, 2, 5, 14].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-accent rounded-full animate-wave"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              {/* Transcript Display Box */}
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                  Live Translation Transcript
                </span>
                <p className="text-zinc-300 text-xs font-light leading-relaxed">
                  &ldquo;I keep worrying that if we miss the deployment tomorrow, the entire client roadmap will fall apart. Maybe I should have pushed the team harder...&rdquo;
                </p>
              </div>
            </div>

            {/* Right Mock Panel */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between gap-6">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">
                  AI Cognitive Diagnosis
                </span>
                <div className="flex flex-col gap-2">
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain size={12} className="text-primary" />
                      <span className="text-xs font-semibold text-zinc-200">Catastrophizing</span>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-sm bg-primary/20 text-white select-none">
                      High Alert
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smile size={12} className="text-zinc-500" />
                      <span className="text-xs font-semibold text-zinc-300">Should Statements</span>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-400 select-none">
                      Mild
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/15">
                <span className="text-[9px] font-semibold text-accent uppercase tracking-wider block mb-1">
                  Active Reframe Action
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed font-light">
                  Write down the best-case roadmap outcome and compare it with the worst-case scenario.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section className="px-8 py-20 max-w-7xl mx-auto border-t border-white/5 relative">
        {/* Glow Spheres */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="text-center mb-16 select-none">
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
            Built for Metacognitive awareness
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto font-light mt-2">
            Engineered using precise processing nodes to record, parse and track cognitive behaviors.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={fadeUp} custom={1}>
            <Card hoverable className="h-full flex flex-col gap-4 border-white/5 hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Mic size={22} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Voice Stream Engine</h3>
              <p className="text-[#A1A1AA] text-xs leading-relaxed font-light">
                Simply speak. High-accuracy real-time recordings capture the audio, translate native dialects, and format paragraphs instantly.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <Card hoverable className="h-full flex flex-col gap-4 border-white/5 hover:border-accent/20">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Brain size={22} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Cognitive Distortion Parsing</h3>
              <p className="text-[#A1A1AA] text-xs leading-relaxed font-light">
                AI cognitive processing analyzes speech patterns to flag cognitive distortions like overgeneralization, catastrophizing, and should statements.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <Card hoverable className="h-full flex flex-col gap-4 border-white/5 hover:border-emerald-500/20">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Languages size={22} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Multilingual Processing</h3>
              <p className="text-[#A1A1AA] text-xs leading-relaxed font-light">
                Say goodbye to language barriers. Deep support for multiple dialects enables complete mapping regardless of dialect choices.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Tabs / Methodology Section */}
      <section className="px-8 py-24 bg-[#0C0C0E]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/5 mb-4 select-none">
              <Activity size={12} className="text-accent animate-pulse" />
              <span className="text-xs font-semibold text-accent tracking-wider uppercase">
                Methodology Core
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-6 uppercase">
              Our Cognitive Alignment Pipeline
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-light">
              We leverage multi-stage pipelines to process unstructured verbal diaries, convert dialect nodes into localized transcripts, and evaluate structural logic patterns.
            </p>

            {/* Tabs List */}
            <div className="flex flex-col gap-3.5 select-none">
              {Object.keys(tabContent).map((tabKey) => {
                const isActive = activeTab === tabKey;
                const titleText =
                  tabKey === "stt"
                    ? "1. Voice to Text Translation"
                    : tabKey === "analysis"
                    ? "2. Cognitive Logic Analysis"
                    : "3. Behavior Tracking Maps";

                return (
                  <button
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey as "stt" | "analysis" | "insights")}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-white/5 border-primary/20 text-white"
                        : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span className="text-sm font-semibold block">{titleText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs Display Content */}
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card className="p-8 border-white/5 bg-[#09090B]/60 backdrop-blur-md flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] font-semibold text-accent tracking-wider uppercase block mb-1">
                      {tabContent[activeTab].tagline}
                    </span>
                    <h4 className="text-xl font-bold text-white tracking-tight">
                      {tabContent[activeTab].title}
                    </h4>
                  </div>

                  <p className="text-zinc-400 text-xs leading-relaxed font-light">
                    {tabContent[activeTab].desc}
                  </p>

                  <div className="border-t border-white/5 pt-4">
                    <ul className="flex flex-col gap-2.5">
                      {tabContent[activeTab].metrics.map((metric, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300 font-light">
                          <CheckCircle size={13} className="text-accent shrink-0" />
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner Section */}
      <section className="px-8 py-24 text-center max-w-4xl mx-auto relative select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 uppercase">
          Ready to align your mind?
        </h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light mb-8">
          Join the public sandbox. Begin voice reflections and obtain personalized cognitive distortion analysis immediately.
        </p>

        <Link href="/register">
          <Button variant="primary" size="lg" className="gap-2 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
            <span>Get Started Free</span>
            <ArrowRight size={16} />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-white">CM</span>
          </div>
          <span className="font-bold text-zinc-400">CogniMirror</span>
        </div>
        <p>&copy; 2026 CogniMirror. All Rights Reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}

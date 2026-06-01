"use client";

/* ═══════════════════════════════════════════════════
   SensesSum – Main Page
   PRD §6.3 : Hero + Workspace + Results
   ═══════════════════════════════════════════════════ */

import { useState, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

// Lazy-load the heavy 3D component so it doesn't block first paint
const Ring3D = lazy(() => import("@/components/Ring3D"));

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  // ── State ──────────────────────────────────────
  const [text, setText] = useState("");
  const [mode, setMode] = useState("extractive"); // "extractive" | "abstractive"
  const [ringState, setRingState] = useState("idle"); // "idle" | "processing" | "done"
  const [result, setResult] = useState(null);
  const [rougeScores, setRougeScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preprocessData, setPreprocessData] = useState(null);

  // ── Summarize Handler ──────────────────────────
  const handleSummarize = useCallback(async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setRingState("processing");
    setResult(null);
    setRougeScores(null);

    try {
      // Fire preprocess + summarize in parallel
      const [prepRes, sumRes] = await Promise.all([
        fetch(`${API}/api/preprocess`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }),
        fetch(`${API}/api/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode }),
        }),
      ]);

      const prepData = await prepRes.json();
      const sumData = await sumRes.json();

      setPreprocessData(prepData.data);
      setResult(sumData.data);
      setRingState("done");

      // Automate ROUGE calculation using the original text as the reference
      if (sumData?.data?.summary) {
        fetch(`${API}/api/evaluate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generated_summary: sumData.data.summary,
            reference_summary: text,
          }),
        })
          .then((res) => res.json())
          .then((rData) => setRougeScores(rData.data))
          .catch((err) => console.error("ROUGE Error:", err));
      }

      // Ease back to idle after 2s
      setTimeout(() => setRingState("idle"), 2000);
    } catch (err) {
      console.error("API Error:", err);
      setRingState("idle");
    } finally {
      setLoading(false);
    }
  }, [text, mode, loading]);

  return (
    <>
      <Navbar />

      {/* ═══ Main Content ═══ */}
      <main className="relative z-10 min-h-screen px-4 md:px-10 lg:px-16 pt-32 pb-24 max-w-[1500px] mx-auto w-full flex flex-col">
        
        {/* 1. Hero Text */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Distraction-Free <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
              Intelligent Summarization
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Paste your long research paragraphs into the tool and receive a high-level summary instantly in a polished, cognitively soothing environment.
          </p>
        </div>

        {/* 2. Main Workspace "Window" */}
        <div className="w-full bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* ── LEFT COLUMN (Input & Controls) ── */}
            <div className="p-8 md:p-12 flex flex-col space-y-8 relative z-10">
              
              <div className="flex bg-white/60 p-1.5 rounded-full border border-white/80 shadow-sm self-start">
                <button
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${mode === "extractive" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setMode("extractive")}
                >
                  Extractive Matrix
                </button>
                <button
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${mode === "abstractive" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setMode("abstractive")}
                >
                  Abstractive PEGASUS
                </button>
              </div>

              <textarea
                id="input-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[300px] p-6 rounded-3xl bg-white/60 border border-white/80 shadow-inner focus:ring-2 focus:ring-indigo-300 outline-none resize-y text-gray-800 text-lg leading-relaxed transition-all placeholder-gray-400"
                placeholder="Paste your long text here to automate your reading workflow…"
                rows={8}
              />

              <button
                className="btn-primary-pill text-lg py-4 flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSummarize}
                disabled={loading || !text.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Processing Pipeline…
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="mr-1">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Summarize
                  </>
                )}
              </button>
            </div>

            {/* ── RIGHT COLUMN (Floating Elements & Analytics) ── */}
            <div className="p-8 md:p-12 bg-cyan-grid border-l border-white/30 flex flex-col space-y-10 relative">
              
              {/* Floating Summary Card */}
              <motion.div 
                animate={{ y: [0, -6, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                className="glass-card-v2 p-8"
              >
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    Generated Summary
                  </h2>
                </div>
                {result ? (
                  <p className="text-gray-800 leading-relaxed text-[0.95rem]">
                    {result.summary}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24">
                    <span className="text-gray-400 font-medium text-sm">Your summary will appear here</span>
                  </div>
                )}
              </motion.div>

              {/* Floating Pipeline Inspector */}
              <motion.div 
                animate={{ y: [0, -6, 0] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }} 
                className="glass-card-v2 p-8"
              >
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Pipeline Inspector
                  </h2>
                </div>
                
                {preprocessData ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest mb-2 text-gray-500">
                        Filtered tokens:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {preprocessData.filtered_tokens?.slice(0, 15).map((tok, i) => (
                          <span key={i} className="text-[0.7rem] px-2 py-0.5 rounded bg-white/60 text-gray-700 border border-white">
                            {tok}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-20">
                    <span className="text-gray-400 font-medium text-sm">Awaiting pipeline data...</span>
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </div>

        {/* 3. Minimalist Analytics Scoreboard (Below Fold) */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-6"
          >
            <ScoreboardMetric label="Inference Time" value={`${result.inference_time_ms?.toFixed(0)} ms`} />
            <ScoreboardMetric label="Compression" value={`${result.compression_ratio?.toFixed(1)}%`} />
            <ScoreboardMetric label="Words" value={result.summary?.split(/\s+/).length} />
            
            <div className="col-span-2 flex flex-row gap-6">
              {rougeScores ? (
                <>
                  <ScoreboardMetric label="ROUGE-1 F1" value={`${(rougeScores.rouge_1.f1 * 100).toFixed(1)}%`} />
                  <ScoreboardMetric label="ROUGE-L F1" value={`${(rougeScores.rouge_l.f1 * 100).toFixed(1)}%`} />
                </>
              ) : (
                <ScoreboardMetric label="ROUGE Evaluation" value="..." />
              )}
            </div>
          </motion.div>
        )}

      </main>
    </>
  );
}

/* ── UI Helper Components ────────────────────────── */

function MetricCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center flex flex-col justify-center">
      <div className="font-bold text-xl text-gray-900">{value}</div>
      <div className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-500 mt-1.5">{label}</div>
    </div>
  );
}

function PipelineStat({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center flex flex-col justify-center">
      <div className="font-bold text-2xl text-gray-900">{value}</div>
      <div className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mt-1.5 leading-tight">{label}</div>
    </div>
  );
}

function RougeMetric({ label, scores }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.75rem] font-bold uppercase tracking-widest text-gray-800">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900">
          F1: {(scores.f1 * 100).toFixed(1)}%
        </span>
      </div>
      <div className="rouge-bar-track">
        <div className="rouge-bar-fill" style={{ width: `${scores.f1 * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs font-medium text-gray-500">
        <span>P: {(scores.precision * 100).toFixed(1)}%</span>
        <span>R: {(scores.recall * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

function ScoreboardMetric({ label, value }) {
  return (
    <div className="flex flex-col">
      <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">{value}</div>
      <div className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-500">{label}</div>
    </div>
  );
}

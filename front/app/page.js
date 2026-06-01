"use client";

/* ═══════════════════════════════════════════════════
   SensesSum – Main Page
   PRD §6.3 : Hero + Workspace + Results
   ═══════════════════════════════════════════════════ */

import { useState, useCallback, lazy, Suspense } from "react";
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
  const [refText, setRefText] = useState("");
  const [evaluating, setEvaluating] = useState(false);

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

      // Ease back to idle after 2s
      setTimeout(() => setRingState("idle"), 2000);
    } catch (err) {
      console.error("API Error:", err);
      setRingState("idle");
    } finally {
      setLoading(false);
    }
  }, [text, mode, loading]);

  // ── ROUGE Evaluate Handler ─────────────────────
  const handleEvaluate = useCallback(async () => {
    if (!refText.trim() || !result?.summary) return;
    setEvaluating(true);
    try {
      const res = await fetch(`${API}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generated_summary: result.summary,
          reference_summary: refText,
        }),
      });
      const data = await res.json();
      setRougeScores(data.data);
    } finally {
      setEvaluating(false);
    }
  }, [refText, result?.summary]);

  return (
    <>
      {/* Ambient mesh background */}
      <div className="ambient-canvas" />

      {/* 3D Ring – right/lower viewport */}
      <Suspense fallback={null}>
        <Ring3D state={ringState} />
      </Suspense>

      {/* Navigation */}
      <Navbar />

      {/* ═══ Main Content ═══ */}
      <main className="relative z-10 min-h-screen px-4 md:px-10 lg:px-16 pt-24 pb-24 max-w-[1500px] mx-auto w-full flex flex-col items-center">
        
        {/* Header Titles */}
        <div className="w-full mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="heading-display text-4xl md:text-5xl" style={{ color: "var(--text-primary)" }}>
              Create New Summary
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-600 max-w-lg">
              Syllabus-aligned NLP pipeline supporting TF-IDF extractive and PEGASUS abstractive modes.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="badge-beta bg-white/50 backdrop-blur-sm shadow-sm border border-white/40">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#6c5ce7" strokeWidth="1.5" fill="none" />
                <circle cx="6" cy="6" r="2" fill="#6c5ce7" />
              </svg>
              NLP Mini-Project Live
            </span>
          </div>
        </div>

        {/* Dashboard Main Container */}
        <div className="glass-card-solid w-full p-6 md:p-8 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            
            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col space-y-10">
              
              {/* 1. Input Workspace */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold heading-display" style={{ color: "var(--text-primary)" }}>
                  Source Document
                </h2>
                <textarea
                  id="input-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="text-input shadow-inner bg-white/60"
                  placeholder="Paste your long text here to automate your reading workflow…"
                  rows={7}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="toggle-pill shadow-sm">
                    <button
                      className={mode === "extractive" ? "active" : ""}
                      onClick={() => setMode("extractive")}
                    >
                      Extractive Matrix
                    </button>
                    <button
                      className={mode === "abstractive" ? "active" : ""}
                      onClick={() => setMode("abstractive")}
                    >
                      Abstractive PEGASUS
                    </button>
                  </div>

                  <button
                    className="btn-action shadow-md"
                    onClick={handleSummarize}
                    disabled={loading || !text.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* 2. Generated Summary & Metrics */}
              <section className="space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
                  <h2 className="text-lg font-semibold heading-display flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--deep-violet)" }} />
                    Generated Summary
                  </h2>
                  {result && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-purple-100 text-purple-800">
                      {result.mode === "extractive" ? "TF-IDF" : "PEGASUS"}
                    </span>
                  )}
                </div>

                {result ? (
                  <div className="space-y-6">
                    <div className="p-5 bg-white/50 rounded-xl border border-white/60 shadow-sm min-h-[140px]">
                      <p className="result-summary text-[0.95rem]">{result.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <MetricCard label="Inference Time" value={`${result.inference_time_ms?.toFixed(0) || "—"} ms`} />
                      <MetricCard label="Compression" value={`${result.compression_ratio?.toFixed(1) || "—"}%`} />
                      <MetricCard 
                        label={result.mode === "extractive" ? "Sentences" : "Words"} 
                        value={result.summary_word_count || result.summary_sentence_count || result.summary?.split(/\s+/).length || "—"} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/30">
                    <span className="text-gray-400 text-sm">Summary will appear here</span>
                  </div>
                )}
              </section>

            </div>


            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col bg-white/40 p-6 rounded-2xl border border-white/60 shadow-sm space-y-10">
              
              {/* 1. Pipeline Inspection */}
              <section className="space-y-5">
                <h2 className="text-lg font-semibold heading-display flex items-center gap-2 border-b border-gray-200/50 pb-2" style={{ color: "var(--text-primary)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--deep-violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Pipeline Analytics
                </h2>

                {preprocessData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <PipelineStat label="Sentences" value={preprocessData.sentence_count} />
                      <PipelineStat label="Raw Tokens" value={preprocessData.raw_token_count} />
                      <PipelineStat label="Filtered Tokens" value={preprocessData.filtered_token_count} />
                      <PipelineStat label="Stop Words Removed" value={preprocessData.removed_stop_word_count} />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider mb-2 text-gray-500">
                          Filtered tokens (sample):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {preprocessData.filtered_tokens?.slice(0, 30).map((tok, i) => (
                            <span key={i} className="text-[0.7rem] px-2 py-0.5 rounded-md bg-purple-100/50 text-purple-700 border border-purple-200">
                              {tok}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider mb-2 text-gray-500">
                          Removed stop words (sample):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[...new Set(preprocessData.removed_stop_words)]?.slice(0, 15).map((tok, i) => (
                            <span key={i} className="text-[0.7rem] px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 line-through">
                              {tok}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300/60 rounded-xl bg-gray-50/30">
                    <span className="text-gray-400 text-sm">Waiting for text processing...</span>
                  </div>
                )}
              </section>

              {/* 2. ROUGE Evaluation */}
              <section className="space-y-4 flex-1">
                <h2 className="text-lg font-semibold heading-display flex items-center gap-2 border-b border-gray-200/50 pb-2" style={{ color: "var(--text-primary)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--deep-violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                  ROUGE Evaluation
                </h2>

                <textarea
                  value={refText}
                  onChange={(e) => setRefText(e.target.value)}
                  placeholder="Paste a reference summary here to compute ROUGE scores against the generated summary..."
                  className="text-input shadow-inner bg-white/70"
                  style={{ minHeight: "100px", fontSize: "0.85rem", padding: "16px" }}
                />

                <button
                  className="btn-action w-full justify-center bg-white"
                  onClick={handleEvaluate}
                  disabled={evaluating || !refText.trim() || !result?.summary}
                >
                  {evaluating ? (
                    <>
                      <span className="spinner" />
                      Evaluating…
                    </>
                  ) : (
                    "Compute ROUGE Scores"
                  )}
                </button>

                {rougeScores ? (
                  <div className="p-4 bg-white/60 rounded-xl shadow-sm border border-white space-y-4 mt-2">
                    <div className="text-[0.7rem] space-y-1 text-gray-600 mb-3">
                      <p><strong>ROUGE-1</strong>: Exact word overlap.</p>
                      <p><strong>ROUGE-L</strong>: Sentence structure overlap.</p>
                      <p className="text-gray-400"><em>* Higher F1 is better. P=Precision, R=Recall.</em></p>
                    </div>
                    <RougeMetric label="ROUGE-1" scores={rougeScores.rouge_1} />
                    <RougeMetric label="ROUGE-L" scores={rougeScores.rouge_l} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300/60 rounded-xl bg-gray-50/30 mt-2">
                    <span className="text-gray-400 text-sm text-center px-4">
                      {result ? "Enter reference text and compute scores" : "Generate a summary first"}
                    </span>
                  </div>
                )}
              </section>

            </div>

          </div>
        </div>
      </main>
    </>
  );
}

/* ── UI Helper Components ────────────────────────── */

function MetricCard({ label, value }) {
  return (
    <div className="bg-white/60 p-3 rounded-xl border border-white/40 shadow-sm text-center">
      <div className="font-semibold text-lg" style={{ color: "var(--deep-violet)" }}>{value}</div>
      <div className="text-[0.65rem] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function PipelineStat({ label, value }) {
  return (
    <div className="bg-white/60 p-3 rounded-xl border border-white/40 shadow-sm text-center">
      <div className="font-semibold text-xl" style={{ color: "var(--text-primary)" }}>{value}</div>
      <div className="text-[0.6rem] uppercase tracking-wider text-gray-500 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function RougeMetric({ label, scores }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.75rem] font-bold uppercase tracking-wider text-indigo-800">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-800">
          F1: {(scores.f1 * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${scores.f1 * 100}%` }} />
      </div>
      <div className="flex justify-between text-[0.7rem] text-gray-500">
        <span>P: {(scores.precision * 100).toFixed(1)}%</span>
        <span>R: {(scores.recall * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

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
      {/* Ambient mesh background */}
      <div className="ambient-canvas" />

      {/* 3D Ring – right/lower viewport */}
      <Suspense fallback={null}>
        <Ring3D state={ringState} />
      </Suspense>

      {/* Navigation */}
      <Navbar />

      {/* ═══ Main Content ═══ */}
      <main className="relative z-10 min-h-screen px-4 md:px-10 lg:px-16 pt-28 pb-24 max-w-[1500px] mx-auto w-full flex flex-col">
        
        {/* Dashboard Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-4">
          
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col space-y-12 bg-white p-8 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
              
              {/* 1. Input Workspace */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold heading-display border-b border-gray-200 pb-3" style={{ color: "var(--text-primary)" }}>
                  Source Document
                </h2>
                <textarea
                  id="input-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[220px] p-6 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none resize-y text-gray-700 leading-relaxed transition-all"
                  placeholder="Paste your long text here to automate your reading workflow…"
                  rows={8}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200">
                    <button
                      className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${mode === "extractive" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                      onClick={() => setMode("extractive")}
                    >
                      Extractive Matrix
                    </button>
                    <button
                      className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${mode === "abstractive" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                      onClick={() => setMode("abstractive")}
                    >
                      Abstractive PEGASUS
                    </button>
                  </div>

                  <button
                    className="btn-action"
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
              <section className="space-y-6 flex-1">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h2 className="text-xl font-bold heading-display flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                    Generated Summary
                  </h2>
                  {result && (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {result.mode === "extractive" ? "TF-IDF" : "PEGASUS"}
                    </span>
                  )}
                </div>

                {result ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[160px] text-gray-700 leading-relaxed text-[0.95rem]">
                      <p>{result.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <MetricCard label="Inference Time" value={`${result.inference_time_ms?.toFixed(0) || "—"} ms`} />
                      <MetricCard label="Compression" value={`${result.compression_ratio?.toFixed(1) || "—"}%`} />
                      <MetricCard 
                        label={result.mode === "extractive" ? "Sentences" : "Words"} 
                        value={result.summary_word_count || result.summary_sentence_count || result.summary?.split(/\s+/).length || "—"} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <span className="text-gray-400 font-medium">Your summary will appear here</span>
                  </div>
                )}
              </section>

            </div>


            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col space-y-12 bg-white p-8 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
              
              {/* 1. Pipeline Inspection */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold heading-display flex items-center gap-3 border-b border-gray-200 pb-3" style={{ color: "var(--text-primary)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Pipeline Analytics
                </h2>

                {preprocessData ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <PipelineStat label="Sentences" value={preprocessData.sentence_count} />
                      <PipelineStat label="Raw Tokens" value={preprocessData.raw_token_count} />
                      <PipelineStat label="Filtered Tokens" value={preprocessData.filtered_token_count} />
                      <PipelineStat label="Stop Words Removed" value={preprocessData.removed_stop_word_count} />
                    </div>

                    <div className="space-y-5">
                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-widest mb-3 text-gray-500">
                          Filtered tokens (sample):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {preprocessData.filtered_tokens?.slice(0, 30).map((tok, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                              {tok}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-widest mb-3 text-gray-500">
                          Removed stop words (sample):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(preprocessData.removed_stop_words)]?.slice(0, 15).map((tok, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-400 line-through">
                              {tok}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <span className="text-gray-400 font-medium">Waiting for text processing...</span>
                  </div>
                )}
              </section>

              {/* 2. ROUGE Evaluation */}
              <section className="space-y-6 flex-1">
                <h2 className="text-xl font-bold heading-display flex items-center gap-3 border-b border-gray-200 pb-3" style={{ color: "var(--text-primary)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                  ROUGE Evaluation
                </h2>

                {rougeScores ? (
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="text-[0.75rem] space-y-1.5 text-gray-500 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p><strong className="text-gray-700">ROUGE-1</strong>: Exact word overlap.</p>
                      <p><strong className="text-gray-700">ROUGE-L</strong>: Sentence structure overlap.</p>
                      <p className="text-gray-500 mt-2"><em>* Automatically evaluated against original text. Higher F1 is better.</em></p>
                    </div>
                    <RougeMetric label="ROUGE-1" scores={rougeScores.rouge_1} />
                    <RougeMetric label="ROUGE-L" scores={rougeScores.rouge_l} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <span className="text-gray-400 font-medium text-center px-4">
                      {result ? "Calculating ROUGE scores automatically..." : "Generate a summary first"}
                    </span>
                  </div>
                )}
              </section>

            </div>

        </div>
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

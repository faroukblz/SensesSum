"use client";

/* ═══════════════════════════════════════════════════
   SensesSum – Main Page
   PRD §6.3 : Hero + Workspace + Results
   ═══════════════════════════════════════════════════ */

import { useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ResultsPanel from "@/components/ResultsPanel";

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
  const [showPipeline, setShowPipeline] = useState(false);

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
  const handleEvaluate = useCallback(async (generated, reference) => {
    const res = await fetch(`${API}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generated_summary: generated,
        reference_summary: reference,
      }),
    });
    const data = await res.json();
    setRougeScores(data.data);
  }, []);

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
      <main className="relative z-10 min-h-screen flex flex-col items-start justify-center px-6 md:px-16 pt-24 pb-12">
        {/* ── Hero Section ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl w-full space-y-6"
        >
          {/* Beta badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="badge-beta">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#6c5ce7" strokeWidth="1.5" fill="none" />
                <circle cx="6" cy="6" r="2" fill="#6c5ce7" />
              </svg>
              NLP Mini-Project Live
            </span>
          </motion.div>

          {/* Headline */}
          <h1>
            <span
              className="heading-display block text-4xl md:text-5xl lg:text-6xl"
              style={{ color: "var(--text-primary)" }}
            >
              Summarize Smarter.
            </span>
            <span className="heading-display heading-italic block text-4xl md:text-5xl lg:text-6xl mt-1">
              <span style={{ color: "var(--text-primary)" }}>Read </span>
              <span style={{ color: "var(--deep-violet)" }}>Faster.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base md:text-lg max-w-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Paste your long text below. Our syllabus-aligned NLP engine
            will deliver extractive or abstractive summaries with full
            pipeline transparency and ROUGE evaluation.
          </p>
        </motion.div>

        {/* ── Workspace Card ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl mt-8"
        >
          <div className="glass-card-solid p-6 md:p-8 space-y-5">
            {/* Text area */}
            <textarea
              id="input-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-input"
              placeholder="Paste your long text here to automate your reading workflow…"
              rows={6}
            />

            {/* Controls bar */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Mode toggle pill */}
              <div className="toggle-pill">
                <button
                  id="toggle-extractive"
                  className={mode === "extractive" ? "active" : ""}
                  onClick={() => setMode("extractive")}
                >
                  Extractive Matrix
                </button>
                <button
                  id="toggle-abstractive"
                  className={mode === "abstractive" ? "active" : ""}
                  onClick={() => setMode("abstractive")}
                >
                  Abstractive PEGASUS
                </button>
              </div>

              {/* Action buttons */}
              <button
                id="btn-summarize"
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
                    See Summary in Action
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>

              {/* Pipeline inspector toggle */}
              {preprocessData && (
                <button
                  className="btn-demo"
                  onClick={() => setShowPipeline((v) => !v)}
                >
                  {showPipeline ? "Hide" : "Inspect"} Pipeline
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Pipeline Inspector (slide-out) ─ */}
        <AnimatePresence>
          {showPipeline && preprocessData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-2xl mt-4 overflow-hidden"
            >
              <div className="glass-card p-6 space-y-4">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  NLP Pipeline Inspection
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <PipelineStat label="Sentences" value={preprocessData.sentence_count} />
                  <PipelineStat label="Raw Tokens" value={preprocessData.raw_token_count} />
                  <PipelineStat label="Filtered Tokens" value={preprocessData.filtered_token_count} />
                  <PipelineStat label="Stop Words Removed" value={preprocessData.removed_stop_word_count} />
                </div>

                {/* Top tokens preview */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                    Filtered tokens (first 40):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preprocessData.filtered_tokens?.slice(0, 40).map((tok, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "rgba(108, 92, 231, 0.08)",
                          color: "var(--deep-violet)",
                          border: "1px solid rgba(108, 92, 231, 0.15)",
                        }}
                      >
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Removed stop words */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                    Removed stop words (sample):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(preprocessData.removed_stop_words)]?.slice(0, 20).map((tok, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.04)",
                          color: "var(--text-muted)",
                          textDecoration: "line-through",
                        }}
                      >
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Panel ───────────────── */}
        {result && (
          <ResultsPanel
            result={result}
            rougeScores={rougeScores}
            onEvaluate={handleEvaluate}
          />
        )}
      </main>
    </>
  );
}

/* ── Pipeline Stat Mini Card ──────────────────────── */
function PipelineStat({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-value text-lg">{value}</div>
      <div className="metric-label text-[0.65rem]">{label}</div>
    </div>
  );
}

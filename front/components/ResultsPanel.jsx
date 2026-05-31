"use client";

/* ═══════════════════════════════════════════════════
   ResultsPanel – Framer Motion slide-up reveal
   PRD §6.3 Viewport Area 3

   Shows the generated summary, metrics sidebar,
   and ROUGE evaluation scores.
   ═══════════════════════════════════════════════════ */

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ResultsPanel({ result, rougeScores, onEvaluate }) {
  const [refText, setRefText] = useState("");
  const [evaluating, setEvaluating] = useState(false);

  const handleEvaluate = async () => {
    if (!refText.trim() || !result?.summary) return;
    setEvaluating(true);
    try {
      await onEvaluate(result.summary, refText);
    } finally {
      setEvaluating(false);
    }
  };

  if (!result) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-5xl mx-auto mt-8 mb-16 px-4"
      >
        <div className="glass-card-solid p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left: Summary Text ────────── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--deep-violet)" }}
                />
                <h3
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Generated Summary
                </h3>
                <span className="badge-beta ml-auto">
                  {result.mode === "extractive" ? "TF-IDF Extractive" : "T5 Abstractive"}
                </span>
              </div>

              <p className="result-summary">{result.summary}</p>

              {/* ── Metrics Row ─────────────── */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="metric-card">
                  <div className="metric-value">
                    {result.inference_time_ms?.toFixed(0) || "—"}
                    <span className="text-sm font-normal ml-0.5">ms</span>
                  </div>
                  <div className="metric-label">Inference Time</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {result.compression_ratio?.toFixed(1) || "—"}
                    <span className="text-sm font-normal ml-0.5">%</span>
                  </div>
                  <div className="metric-label">Compression</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {result.summary_word_count ||
                      result.summary_sentence_count ||
                      result.summary?.split(/\s+/).length ||
                      "—"}
                  </div>
                  <div className="metric-label">
                    {result.mode === "extractive" ? "Sentences" : "Words"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: ROUGE Sidebar ──────── */}
            <div className="space-y-5">
              <h3
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                ROUGE Evaluation
              </h3>

              {/* Reference input */}
              <textarea
                value={refText}
                onChange={(e) => setRefText(e.target.value)}
                placeholder="Paste a reference summary to compute ROUGE scores…"
                className="text-input"
                style={{ minHeight: "100px", fontSize: "0.85rem" }}
              />

              <button
                className="btn-action w-full justify-center"
                onClick={handleEvaluate}
                disabled={evaluating || !refText.trim()}
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

              {/* Score Display */}
              <AnimatePresence>
                {rougeScores && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 pt-2"
                  >
                    <RougeMetric label="ROUGE-1" scores={rougeScores.rouge_1} />
                    <RougeMetric label="ROUGE-L" scores={rougeScores.rouge_l} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}

/* ── ROUGE Metric Sub-component ────────────────────── */
function RougeMetric({ label, scores }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--deep-violet)" }}
        >
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          F1: {(scores.f1 * 100).toFixed(1)}%
        </span>
      </div>

      {/* F1 bar */}
      <div className="rouge-bar-track">
        <div className="rouge-bar-fill" style={{ width: `${scores.f1 * 100}%` }} />
      </div>

      {/* Precision / Recall */}
      <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span>P: {(scores.precision * 100).toFixed(1)}%</span>
        <span>R: {(scores.recall * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

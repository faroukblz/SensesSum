"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("extractive");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preprocessData, setPreprocessData] = useState(null);
  const [rougeScores, setRougeScores] = useState(null);

  // Poll preprocessing endpoint while processing
  useEffect(() => {
    let interval;
    if (loading && text) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("https://sensessum-back.onrender.com/preprocess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (res.ok) {
            const data = await res.json();
            setPreprocessData(data);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 1500);
    } else {
      setPreprocessData(null);
    }
    return () => clearInterval(interval);
  }, [loading, text]);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setRougeScores(null);
    setPreprocessData(null);

    try {
      const res = await fetch("https://sensessum-back.onrender.com/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model_type: mode }),
      });
      const data = await res.json();
      setResult(data);

      const rougeRes = await fetch("https://sensessum-back.onrender.com/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_text: text,
          summary_text: data.summary,
        }),
      });
      if (rougeRes.ok) {
        const rougeData = await rougeRes.json();
        setRougeScores(rougeData.scores);
      }
    } catch (error) {
      console.error("Summarization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-dot-pattern relative min-h-screen pt-[104px] pb-24 w-full flex flex-col items-center">
        
        {/* ── Typography Hero ── */}
        <div className="w-full px-6 flex flex-col items-center text-center mt-12 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Summarize AI text
          </h1>
          <p className="text-gray-500 max-w-3xl text-lg md:text-xl">
            Transform lengthy research and articles into precise, high-level summaries instantly. Choose between Extractive TF-IDF and Abstractive PEGASUS engines.
          </p>
        </div>

        {/* ── Main Split-Pane Workspace ── */}
        <div className="w-full max-w-7xl px-4 md:px-8">
          
          {/* Segmented Controls (Top Bar) */}
          <div className="w-full bg-white border border-gray-200 rounded-t-xl flex items-center px-2 pt-2 gap-2 overflow-hidden">
            <button
              onClick={() => setMode("extractive")}
              className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                mode === "extractive"
                  ? "border-[#00E5FF] text-[#00E5FF]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Extractive (TF-IDF)
            </button>
            <button
              onClick={() => setMode("abstractive")}
              className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                mode === "abstractive"
                  ? "border-[#00E5FF] text-[#00E5FF]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Abstractive (PEGASUS)
            </button>
          </div>

          {/* Grid Layout Container */}
          <div className="w-full bg-white border-x border-b border-gray-200 rounded-b-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 shadow-sm overflow-hidden">
            
            {/* Left Pane: Input */}
            <div className="flex flex-col relative h-[500px]">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your long text here..."
                className="flex-1 w-full p-8 text-gray-800 text-lg leading-relaxed resize-none focus:outline-none placeholder-gray-400 bg-transparent"
              />
              <div className="absolute bottom-6 left-8">
                <button
                  onClick={handleSummarize}
                  disabled={loading || !text.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="spinner w-4 h-4 border-[#00E5FF]" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00E5FF]"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Summarize
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Pane: Outputs */}
            <div className="flex flex-col h-[500px] overflow-y-auto bg-gray-50">
              
              {/* Output 1: Generated Summary */}
              <div className="flex-1 p-8 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                  Generated Summary
                </h3>
                {result ? (
                  <p className="text-gray-900 text-[0.95rem] leading-relaxed">
                    {result.summary}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">Your summary will appear here.</p>
                )}
              </div>

              {/* Output 2: Pipeline Inspector */}
              <div className="p-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00E5FF]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Pipeline Inspector
                </h3>
                {preprocessData ? (
                  <div className="flex flex-wrap gap-2">
                    {preprocessData.filtered_tokens?.slice(0, 20).map((tok, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded">
                        {tok}
                      </span>
                    ))}
                    {preprocessData.filtered_tokens?.length > 20 && (
                      <span className="text-xs px-2 py-1 text-gray-400">+{preprocessData.filtered_tokens.length - 20} more</span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">Awaiting pipeline data...</p>
                )}
              </div>

            </div>
          </div>
          
          {/* ── Performance Metrics Footer ── */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-6 bg-white border border-gray-200 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100 shadow-sm"
            >
              <ScoreboardMetric label="Inference Time" value={`${result.inference_time_ms?.toFixed(0)} ms`} />
              <ScoreboardMetric label="Compression" value={`${result.compression_ratio?.toFixed(1)}%`} />
              
              {rougeScores ? (
                <>
                  <ScoreboardMetric label="ROUGE-1 F1" value={`${(rougeScores.rouge_1.f1 * 100).toFixed(1)}%`} />
                  <ScoreboardMetric label="ROUGE-L F1" value={`${(rougeScores.rouge_l.f1 * 100).toFixed(1)}%`} />
                </>
              ) : (
                <div className="col-span-2 flex items-center justify-center text-gray-400 text-sm">
                  Computing ROUGE...
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>
    </>
  );
}

function ScoreboardMetric({ label, value }) {
  return (
    <div className="flex flex-col pl-6 first:pl-0">
      <div className="text-2xl font-extrabold text-gray-900 mb-1">{value}</div>
      <div className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-500">{label}</div>
    </div>
  );
}

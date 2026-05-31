"use client";

/* ═══════════════════════════════════════════════════
   Navbar – Top Navigation Bar
   PRD §6.3 Viewport Area 1
   ═══════════════════════════════════════════════════ */

import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
    >
      {/* ── Brand ─────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <BrandLogo />
        <div className="leading-tight">
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            SensesSum
          </span>
          <span className="text-[0.65rem] font-medium block -mt-0.5" style={{ color: "var(--text-muted)" }}>
            Incorporations
          </span>
        </div>
      </div>

      {/* ── Nav Links ─────────────────────── */}
      <div className="hidden md:flex items-center gap-8">
        {["Home", "Architecture", "Syllabus Map"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.target.style.color = "var(--deep-violet)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
          >
            {item}
          </a>
        ))}
      </div>

      {/* ── CTA ───────────────────────────── */}
      <div className="flex items-center gap-4">
        <span
          className="hidden sm:inline text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Have A Question?
        </span>
        <button
          className="text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300"
          style={{
            background: "var(--text-primary)",
            color: "white",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--deep-violet)";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--text-primary)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Book A Call
        </button>
      </div>
    </motion.nav>
  );
}

/* ── SVG Brand Logo (abstract multi-axis dot) ───── */
function BrandLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="8" r="3" fill="#6c5ce7" opacity="0.9" />
      <circle cx="8" cy="18" r="3" fill="#a29bfe" opacity="0.7" />
      <circle cx="20" cy="18" r="3" fill="#c5baf2" opacity="0.7" />
      <circle cx="14" cy="14" r="2" fill="#6c5ce7" opacity="0.5" />
    </svg>
  );
}

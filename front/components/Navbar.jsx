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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white/40 backdrop-blur-md border-b border-white/40"
    >
      {/* ── Brand ─────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <BrandLogo />
        <div className="leading-tight">
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            SensesSum
          </span>
          <span className="text-[0.65rem] font-medium block -mt-0.5 text-gray-500">
            Innovations
          </span>
        </div>
      </div>

      {/* ── Nav Links ─────────────────────── */}
      <div className="hidden md:flex items-center gap-8">
        {["Home", "Architecture", "Syllabus Map"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900"
          >
            {item}
          </a>
        ))}
      </div>

      {/* ── CTA ───────────────────────────── */}
      <div className="flex items-center gap-4">
        <span
          className="hidden sm:inline text-sm text-gray-500"
        >
          Have A Question?
        </span>
        <button
          className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all whitespace-nowrap"
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

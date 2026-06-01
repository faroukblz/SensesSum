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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#18181B] border-b border-gray-800"
    >
      {/* ── Brand ─────────────────────────── */}
      <div className="flex items-center gap-3">
        <BrandLogo />
        <span className="text-lg font-bold tracking-tight text-white">
          SensesSum
        </span>
      </div>

      {/* ── Nav Links ─────────────────────── */}
      <div className="hidden md:flex items-center gap-8">
        {["Home", "Architecture", "Syllabus Map"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-white"
          >
            {item}
          </a>
        ))}
      </div>

      {/* ── Auth Actions ──────────────────── */}
      <div className="flex items-center gap-4">
        <button
          className="px-5 py-2 text-sm font-medium text-white bg-transparent border border-gray-600 rounded-full hover:border-white transition-colors whitespace-nowrap"
        >
          Log in
        </button>
        <button
          className="px-5 py-2 text-sm font-bold text-gray-900 bg-cyan-400 rounded-full hover:bg-cyan-300 transition-colors whitespace-nowrap"
        >
          Sign up
        </button>
      </div>
    </motion.nav>
  );
}

/* ── SVG Brand Logo (Minimalist Cyan) ───── */
function BrandLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="8" height="8" rx="2" fill="#00E5FF" />
      <rect x="14" y="2" width="8" height="8" rx="2" fill="#00E5FF" opacity="0.5" />
      <rect x="2" y="14" width="8" height="8" rx="2" fill="#00E5FF" opacity="0.2" />
    </svg>
  );
}

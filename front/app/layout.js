import "./globals.css";

export const metadata = {
  title: "SensesSum – Intelligent Text Summarization Platform",
  description:
    "A modern, syllabus-aligned NLP summarization platform featuring extractive TF-IDF and abstractive T5 engines with ROUGE evaluation and real-time pipeline inspection.",
  keywords: ["NLP", "text summarization", "TF-IDF", "T5", "ROUGE", "machine learning"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

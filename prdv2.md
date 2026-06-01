Product Requirement Document (PRD)

Project Name: SensesSum – Intelligent Modern Text Summarization Platform

Document Version: 2.0.0

Target Semester: NLP Mini-Project

Author: AI Engineering & Design Team

1. Project Overview & Objectives

1.1 Scope & Vision

SensesSum is a modern, web-based NLP mini-project that delivers an end-to-end Text Summarization utility. Inspired by high-end fintech and modern web aesthetics, the product bridges the gap between traditional academic NLP foundations and cutting-edge frontend user experiences. The application allows users to input raw documents, URLs, or articles and receive structured, highly accurate summaries using algorithms strictly aligned with the course syllabus, all wrapped in a visually soothing, highly polished interface.

1.2 Core Value Proposition

Syllabus-Compliant Architecture: Implements multiple levels of NLP paradigms taught in class, ranging from baseline statistical/linguistic methods (TF-IDF/LexRank) to sequence-to-sequence language modeling (PEGASUS).

Immersive, Cognitive-Load-Reducing UX: Departs from cluttered academic UIs. It introduces a modern, fluid theme featuring soft pastel gradients, frosted glass panels, and floating contextual elements designed to make interacting with complex AI pipelines feel effortless and premium.

2. Alignment with Academic Syllabus

To satisfy the requirements of a mini-project while respecting the constraint to avoid overly advanced, non-syllabus topics, the application intentionally maps its core operations back to specific course chapters:

Phase

System Component

Syllabus Reference

Notes / Implementations

Ingestion

Document Reader & Normalizer

Chapter II: Text Preprocessing

Code steps for manual cleaning, regex-based tokenization, lowercase normalization, and stop-word removal.

Feature Eng.

Text Vectorization Matrix

Chapter IV: Text Representation

Generates Bag-of-Words and TF-IDF matrices to evaluate sentence importance weights.

NLP Engine

Baseline Model (Extractive)

Chapter VI: Language Models (6.1)

Extractive scoring built using Sentence-level N-gram overalps and Graph-based sentence similarity.

NLP Engine

Core Model (Abstractive)

Chapter VI: Language Models (6.4, 6.5)

Abstractive generation using Recurrent Neural Networks (RNN/LSTM) or a pre-trained PEGASUS Architecture (Explicitly referenced in Topic 5.2/6.5).

Validation

Quantitative Score Metrics

Chapter VI: Evaluation (6.6)

System calculation of ROUGE-1, ROUGE-2, and ROUGE-L metrics compared to user-provided or gold summaries.

Application

Text Summarization Core

Chapter VIII: Applications (8.2)

Full execution of the designated Chapter 8 Application module.

3. Product Features & User Stories

3.1 Feature Breakdown

1. The "Glow-Up" Landing Interface

Landing State: A spacious, high-contrast hero section with bold typography against a soft, fluid pastel background (blues and purples). Includes a subtle architectural grid pattern and floating, frosted-glass interactive elements that represent NLP data points.

Input Channels: A clean, borderless input area for plain text that seamlessly blends into the glassmorphic cards, accompanied by pill-shaped upload utilities.

2. Dual-Engine Selector (Extractive vs. Abstractive)

Extractive Switch: Computes an exact extraction summary by picking top-weighted sentences based on TF-IDF and sentence metrics (Syllabus Chapter IV).

Abstractive Switch: Leverages a sequence-to-sequence conditional text generator framework (PEGASUS) via the HuggingFace API to synthesize rewritten, human-like summaries (Syllabus Chapter VI).

3. Floating "NLP Pipeline Inspector"

Rather than a clunky slide-out panel, pipeline data is displayed in elegant, floating frosted glass cards overlaid on the background grid.

Displays tokenized views and matrix weight highlights cleanly without disrupting the primary reading experience.

4. Minimalist Analytics Scoreboard

Renders execution statistics directly below the fold in a clean, horizontal metrics row: Compression Ratio %, Inference Latency (ms).

Automated ROUGE Evaluation: Automatically computes ROUGE-1 and ROUGE-L metrics instantly, displayed as minimal, scannable data points rather than heavy charts.

3.2 User Stories

As a Student, I want to paste a long research paragraph into the tool so that I can see a 3-sentence high-level summary instantly in a distraction-free environment.

As a Grading Professor, I want to interact with the floating Pipeline Inspector cards so that I can verify text cleaning and syllabus-compliant language model architectures are correctly executing.

4. Technical Stack

+------------------------------------------------------------------------+
|                          FRONTEND LAYER (UI)                           |
|  React.js / Next.js (App Router) + Tailwind CSS + Framer Motion        |
|  Design System: Glassmorphism, CSS Mesh Gradients, Backdrop Filters    |
+------------------------------------------------------------------------+
                                   |
                                   | REST API / JSON
                                   v
+------------------------------------------------------------------------+
|                         BACKEND SERVICE LAYER                          |
|  Python 3.10+ Framework: FastAPI or Flask                              |
|  Endpoints: /api/preprocess, /api/summarize, /api/evaluate             |
+------------------------------------------------------------------------+
                                   |
                                   | Native Tensor Functions
                                   v
+------------------------------------------------------------------------+
|                          AI / NLP ENGINE LAYER                         |
|  - Preprocessing: NLTK / Scikit-Learn (Tokenization & TF-IDF)          |
|  - Neural Inference: Hugging Face Inference API (PEGASUS-xsum)         |
|  - Evaluation: Rouge-Score Python Package                              |
+------------------------------------------------------------------------+


5. AI & NLP Engine Specifications

5.1 Step 1: Text Preprocessing Pipeline (Chapter II Implementation)

Every raw text submission must traverse a clear, reproducible, sequential preprocessing script before hitting the neural weights:

Text Cleaning: Stripping out arbitrary markdown markers, HTML tags, and excessive spacing via Python re.

Text Tokenization: Splitting content cleanly into sentences and words using explicit token boundaries.

Text Normalization: Case folding (converting to lowercase), removing stop words via an explicit static array to keep calculations transparent and observable.

5.2 Step 2: The Core Summarization Models (Chapter VI & VIII)

The backend features an explicit code toggle between two engine paths:

Option A: Extractive Baseline (Syllabus Chapters IV & VI.1)

Algorithm: Term Frequency-Inverse Document Frequency (TF-IDF) Sentence Matrix Scoring.

Logic:


$$\text{Score}(S_i) = \frac{\sum_{w \in S_i} \text{TF-IDF}(w, D)}{\text{Length}(S_i)}$$

The top $N$ sentences with the highest average term weights are selected and reordered chronologically to form the baseline summary.

Option B: Abstractive Engine (Syllabus Chapters VI.4 / VI.5.2)

Architecture: Pre-trained PEGASUS Model configured via Hugging Face Inference API.

Justification: PEGASUS is explicitly designed for summarization using Gap Sentence Generation (GSG) as a pre-training objective, fitting the sequence-to-sequence generation syllabus requirements.

5.3 Step 3: Evaluation Framework (Chapter VI.6 Implementation)

To fulfill the evaluation requirement of Chapter VI, the system includes a scoring utility utilizing the rouge-score package to evaluate machine outputs:

ROUGE-1: Measures unigram overlap between the computed summary and an optional reference ground-truth text.

ROUGE-L: Evaluates longest common subsequence (LCS) tracking structural consistency.

6. UI/UX Design & Frontend Requirements

6.1 Core Aesthetic: Modern Glassmorphism & Fluid Gradients

Color Palette (The "Glow" Effect):

Background: Smooth, diffuse, multi-color mesh gradients focusing on soft blues (#E0F2FE), pale lavenders (#F3E8FF), and pure white.

Text: High contrast. Deep slate (#111827) or pure black for primary headers to ground the airy design.

Visual Structure & Whitespace: Implement a generous, breathable layout within a massive, subtly rounded main container (acting as a "window"). Avoid sharp, solid borders; rely entirely on soft drop shadows and structural spacing.

Graphic Accents: Incorporate a faint, light-cyan architectural grid pattern (background-image: linear-gradient) behind floating elements on the right side to provide a sense of technical precision balancing the soft gradients.

6.2 Component Architecture & Best Practices

Typography Hierarchy: Use a highly legible modern sans-serif font (e.g., Inter, SF Pro). Hero text must be massive, tight-leaded, and left-aligned for immediate impact (F-pattern reading). Subtitles should be medium gray and highly readable.

Interactive Elements (Pill Buttons): All primary calls-to-action (like the "Summarize" button) must be fully rounded pill shapes. Primary actions use a soft blue-to-indigo gradient with white text; secondary actions use solid white or soft gray fills.

Frosted Glass Cards: Dynamic data, outputs, and floating pipeline stats must be housed in glassmorphic containers. CSS requirements: background: rgba(255, 255, 255, 0.6), backdrop-filter: blur(16px), border: 1px solid rgba(255, 255, 255, 0.8), and a high border radius (rounded-2xl or rounded-3xl).

6.3 Layout Mapping

Top Navigation: Ultra-minimalist. Brand logo on the far left, centered subtle text links with active hover states, and a pill-shaped primary action button on the far right.

Hero / Workspace Zone:

Left Side: Bold value proposition text. Below it, the primary input area and Engine Toggle switches styled as soft pill segments.

Right Side: Floating glass cards displaying the "Generated Summary" and "Pipeline Inspector" live statistics that gently hover using Framer Motion (y: [0, -10, 0]), overlaying the faint cyan grid pattern.

Results & Metrics Zone: Displayed in a clean, horizontal format below the fold. Large, bold numbers for ROUGE scores (e.g., "47.0%"), paired with tiny, crisp label text ("ROUGE-1 F1") below them, ensuring the metrics are effortlessly scannable.

7. Functional & Non-Functional Requirements

7.1 Functional Requirements

FR-1: System must accept raw text strings ranging from 100 to 5,000 words.

FR-2: System must isolate and display intermediate processing data (token count, removed stop words) in the pipeline inspector view.

FR-3: System must allow downloadable text outputs of the generated summary.

7.2 Non-Functional Requirements

NFR-1 (Performance): Baseline extractive summarization should complete in under 150ms; PEGASUS Abstractive summarization via HF Inference API depends on network latency but generally completes in ~1-3 seconds.

NFR-2 (Rendering): CSS backdrop-filter effects can be resource-intensive; ensure the application degrades gracefully on lower-end devices by falling back to semi-transparent solid backgrounds if necessary.

NFR-3 (Simplicity & Maintainability): The backend project code must be clean and un-bloated, isolating standard deep learning wrappers from core procedural python cleaning functions.

8. Implementation Milestones & Roadmap

Milestone 1 (Data & Core NLP Backend): Script the Chapter II preprocessing steps. Build the native Python Scikit-Learn TF-IDF pipeline and integrate the Hugging Face PEGASUS Inference API into functional FastAPI routes. (Duration: 3 Days)

Milestone 2 (Frontend Theme & Glassmorphism): Construct the React/Tailwind framework, establishing the exact CSS mesh gradients, faint grid backgrounds, and frosted glass panel utilities mimicking the design reference. (Duration: 3 Days)

Milestone 3 (Framer Motion Integration): Program step-based micro-interactions, floating animations for the data cards, and smooth page load transitions. (Duration: 2 Days)

Milestone 4 (Pipeline Validation & Final Polish): Integrate the ROUGE metrics scoreboard, verify rigorous alignment with syllabus topics, and execute debugging passes. (Duration: 2 Days)
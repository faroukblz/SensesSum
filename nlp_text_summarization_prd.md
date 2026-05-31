# Product Requirement Document (PRD)
## Project Name: SensesSum – Intelligent Modern Text Summarization Platform
**Document Version:** 1.0.0  
**Target Semester:** NLP Mini-Project  
**Author:** AI Engineering & Design Team  

---

## 1. Project Overview & Objectives

### 1.1 Scope & Vision
**SensesSum** is a modern, web-based NLP mini-project that delivers an end-to-end Text Summarization utility. Inspired by minimal, high-end aesthetics, the product bridges the gap between traditional academic NLP foundations and cutting-edge frontend user experiences. The application allows users to input raw documents, URLs, or articles and receive structured, highly accurate summaries using algorithms strictly aligned with the course syllabus.

### 1.2 Core Value Proposition
- **Syllabus-Compliant Architecture:** Implements multiple levels of NLP paradigms taught in class, ranging from baseline statistical/linguistic methods (TF-IDF/LexRank) to sequence-to-sequence language modeling (T5).
- **Immersive User Experience:** Departs from boring, clinical academic UIs by introducing a modern, fluid theme featuring real-time 3D feedback loops, canvas transitions, and an elegant layout modeled after the "Senses Innovations" design language.

---

## 2. Alignment with Academic Syllabus

To satisfy the requirements of a mini-project while respecting the constraint to avoid overly advanced, non-syllabus topics, the application intentionally maps its core operations back to specific course chapters:

| Phase | System Component | Syllabus Reference | Notes / Implementations |
| :--- | :--- | :--- | :--- |
| **Ingestion** | Document Reader & Normalizer | **Chapter II: Text Preprocessing** | Code steps for manual cleaning, regex-based tokenization, lowercase normalization, and stop-word removal. |
| **Feature Eng.** | Text Vectorization Matrix | **Chapter IV: Text Representation** | Generates Bag-of-Words and TF-IDF matrices to evaluate sentence importance weights. |
| **NLP Engine** | Baseline Model (Extractive) | **Chapter VI: Language Models (6.1)** | Extractive scoring built using Sentence-level N-gram overalps and Graph-based sentence similarity. |
| **NLP Engine** | Core Model (Abstractive) | **Chapter VI: Language Models (6.4, 6.5)** | Abstractive generation using Recurrent Neural Networks (RNN/LSTM) or a pre-trained **T5 Architecture** (Explicitly referenced in Topic 5.2). |
| **Validation** | Quantitative Score Metrics | **Chapter VI: Evaluation (6.6)** | System calculation of ROUGE-1, ROUGE-2, and ROUGE-L metrics compared to user-provided or gold summaries. |
| **Application**| Text Summarization Core | **Chapter VIII: Applications (8.2)** | Full execution of the designated Chapter 8 Application module. |

---

## 3. Product Features & User Stories

### 3.1 Feature Breakdown

#### 1. Elegant Dashboard & Hero Screen
- **Landing State:** A clean visual landing view showing summary counts, a minimal glassmorphic workspace layout, and a floating interactive 3D mesh structure.
- **Input Channels:** Plain text paste box, file upload utility (.txt, .md), and a mock web scraping input field.

#### 2. Dual-Engine Selector (Extractive vs. Abstractive)
- **Extractive Switch:** Computes an exact extraction summary by picking top-weighted sentences based on *TF-IDF* and sentence metrics (Syllabus Chapter IV).
- **Abstractive Switch:** Leverages a sequence-to-sequence conditional text generator framework (*T5-Small*) to synthesize rewritten, human-like summaries (Syllabus Chapter VI).

#### 3. Real-Time "NLP Pipeline Inspection Window"
- A slide-out panel that visually displays what the AI engine does at each syllabus phase:
  - *Phase 1:* Tokenized view (Words separated, parts of speech or stop words grayed out).
  - *Phase 2:* Matrix Weighting View (Highlighting words with the highest TF-IDF or embedding scores).

#### 4. Analytics & Evaluation Scoreboard
- Renders side-by-side execution statistics: Compression Ratio %, Inference Latency (ms), and Evaluation parameters (ROUGE Scores).

### 3.2 User Stories
- **As a Student**, I want to paste a long research paragraph into the tool so that I can see a 3-sentence high-level summary instantly.
- **As a Grading Professor**, I want to open the Pipeline Inspection Window so that I can verify that text cleaning, tokenization, and syllabus-compliant language model architectures are correctly executing under the hood.

---

## 4. Technical Stack

To ensure simplicity, clean development boundaries, and rigorous adherence to the course scope, the tech stack is divided as follows:

```
+------------------------------------------------------------------------+
|                          FRONTEND LAYER (UI)                           |
|  React.js / Next.js (App Router) + Tailwind CSS + Framer Motion         |
|  Three.js / React Three Fiber (Interactive Canvas & 3D Accents)        |
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
|  - Neural Inference: PyTorch + Hugging Face Transformers (T5-Small)   |
|  - Evaluation: Rouge-Score Python Package                             |
+------------------------------------------------------------------------+
```

---

## 5. AI & NLP Engine Specifications

### 5.1 Step 1: Text Preprocessing Pipeline (Chapter II Implementation)
Every raw text submission must traverse a clear, reproducible, sequential preprocessing script before hitting the neural weights:
1. **Text Cleaning:** Stripping out arbitrary markdown markers, HTML tags, and excessive spacing via Python `re`.
2. **Text Tokenization:** Splitting content cleanly into sentences and words using explicit token boundaries.
3. **Text Normalization:** Case folding (converting to lowercase), removing stop words via an explicit static array to keep calculations transparent and observable.

### 5.2 Step 2: The Core Summarization Models (Chapter VI & VIII)
The backend features an explicit code toggle between two engine paths:

#### Option A: Extractive Baseline (Syllabus Chapters IV & VI.1)
- **Algorithm:** Term Frequency-Inverse Document Frequency (TF-IDF) Sentence Matrix Scoring.
- **Logic:**
  $$	ext{Score}(S_i) = rac{\sum_{w \in S_i} 	ext{TF-IDF}(w, D)}{	ext{Length}(S_i)}$$
- The top $N$ sentences with the highest average term weights are selected and reordered chronologically to form the baseline summary.

#### Option B: Abstractive Engine (Syllabus Chapters VI.4 / VI.5.2)
- **Architecture:** Pre-trained **T5-Small Model** configured out of the box via PyTorch/Hugging Face. 
- **Justification:** T5 is explicitly mandated in section 5.2 of the language model syllabus ("T5 as a translation large language model / generative large model"). For summarization, the prompt prefix `"summarize: "` is prepended to the input sequence before passing into the Encoder-Decoder transformer blocks.

### 5.3 Step 3: Evaluation Framework (Chapter VI.6 Implementation)
To fulfill the evaluation requirement of Chapter VI, the system includes a scoring utility utilizing the `rouge-score` package to evaluate machine outputs:
- **ROUGE-1:** Measures unigram overlap between the computed summary and an optional reference ground-truth text.
- **ROUGE-L:** Evaluates longest common subsequence (LCS) tracking structural consistency.

---

## 6. UI/UX Design & Frontend Requirements

### 6.1 Theme & Aesthetics (Derived from Reference Concept)
- **Color Palette:** - *Canvas Background:* Sleek ambient dark/light fluid mesh. Soft, desaturated lavender (`#E0D7FF`), muted periwinkle (`#C5BAF2`), slate gray text bases, and brilliant white frosted overlays (`rgba(255, 255, 255, 0.7)`).
  - *Accents:* Soft violet glows and thin, low-contrast border boundaries.
- **Visual Structure:** Ultra-clean minimalist canvas layout. No heavy dashboard components or complex card structures. The input UI floats directly over an organic gradient background.

### 6.2 3D Element & Component Canvas (The 3D Ring Concept)
To capture the exact design element from the user's reference image, the frontend integrates an interactive Canvas element using **React Three Fiber (R3F)**:
- **The Element:** An abstract 3D layered ring/semicircle structure resting along the right/lower bounds of the viewport.
- **Interactive States:**
  - *Idle State:* The ring slowly pulses and rotates on a fixed axis with smooth, organic floating motions.
  - *Processing State:* When the user hits "Summarize", the 3D ring alters its speed, drawing a glowing particle track or a spinning halo effect to reflect the tokenization/inference process.
  - *Completion State:* Gently morphs or changes emission color to signal success, smoothly easing back into idle.

### 6.3 Layout Architecture & UI Components

#### Viewport Area 1: Top Navigation Bar
- **Branding:** "SensesSum" text with a small custom SVG multi-axis abstract dot logo.
- **Nav Items:** Minimalist links (Home, Architecture Mapping, Syllabus Check, Book a Call/Demo Button).

#### Viewport Area 2: Workspace Core
- **Input Terminal:** A glassmorphic text container (`backdrop-filter: blur(20px)`). Includes a soft typography placeholder reading: *"Paste your long text here to automate your reading workflow..."*
- **Control Bar:** Integrated micro-buttons positioned elegantly at the bottom of the container box:
  - Toggle switch pill: `[ Extractive Matrix ]` | `( Abstractive T5 )`
  - Action button: `[ See Summary in Action ]` with an integrated arrow icon.

#### Viewport Area 3: Results Panel (Animate-In)
- Appears using a smooth Framer Motion vertical slide-up mask once the backend resolves.
- **Left Column:** Rendered Summary Block using highly readable serif typography.
- **Right Column:** Mini metric dials (Inference Time, Compression %, Token Count).

---

## 7. Functional & Non-Functional Requirements

### 7.1 Functional Requirements
- **FR-1:** System must accept raw text strings ranging from 100 to 5,000 words.
- **FR-2:** System must isolate and display intermediate processing data (token count, removed stop words) in the pipeline inspector view.
- **FR-3:** System must allow downloadable text outputs of the generated summary.

### 7.2 Non-Functional Requirements
- **NFR-1 (Performance):** Baseline extractive summarization should complete in under 150ms; T5 Abstractive summarization should execute in under 2.5 seconds on local CPU threads.
- **NFR-2 (Animations & Fluidity):** Page frame rates must maintain a consistent 60fps across web browsers during 3D canvas rendering by optimizing mesh vertex count.
- **NFR-3 (Simplicity & Maintainability):** The backend project code must be clean and un-bloated, isolating standard deep learning wrappers from core procedural python cleaning functions.

---

## 8. Implementation Milestones & Roadmap

- **Milestone 1 (Data & Core NLP Backend):** Script the Chapter II preprocessing steps. Build the native Python Scikit-Learn TF-IDF pipeline and wrap the Hugging Face T5 tokenization pipeline into functional Flask/FastAPI routes. (Duration: 3 Days)
- **Milestone 2 (Frontend Theme Implementation):** Construct the basic React framework, establishing the exact CSS mesh gradients, layout frames, and glassmorphic panels mimicking the design reference image. (Duration: 3 Days)
- **Milestone 3 (3D Accent & Framer Motion Integration):** Introduce React Three Fiber ring mesh structures. Program step-based micro-interactions connecting form states with animation transitions. (Duration: 2 Days)
- **Milestone 4 (Pipeline Validation & Final Polish):** Integrate the ROUGE metrics scoreboard panel, verify rigorous alignment with syllabus topics, and execute debugging passes. (Duration: 2 Days)

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
- **Syllabus-Compliant Architecture:** Implements multiple levels of NLP paradigms taught in class, ranging from baseline statistical/linguistic methods (TF-IDF/LexRank) to sequence-to-sequence language modeling (PEGASUS).
- **Immersive User Experience:** Departs from boring, clinical academic UIs by introducing a modern, minimalist, Apple-inspired design language with clean functional cards and automated analytics.

---

## 2. Alignment with Academic Syllabus

To satisfy the requirements of a mini-project while respecting the constraint to avoid overly advanced, non-syllabus topics, the application intentionally maps its core operations back to specific course chapters:

| Phase | System Component | Syllabus Reference | Notes / Implementations |
| :--- | :--- | :--- | :--- |
| **Ingestion** | Document Reader & Normalizer | **Chapter II: Text Preprocessing** | Code steps for manual cleaning, regex-based tokenization, lowercase normalization, and stop-word removal. |
| **Feature Eng.** | Text Vectorization Matrix | **Chapter IV: Text Representation** | Generates Bag-of-Words and TF-IDF matrices to evaluate sentence importance weights. |
| **NLP Engine** | Baseline Model (Extractive) | **Chapter VI: Language Models (6.1)** | Extractive scoring built using Sentence-level N-gram overalps and Graph-based sentence similarity. |
| **NLP Engine** | Core Model (Abstractive) | **Chapter VI: Language Models (6.4, 6.5)** | Abstractive generation using Recurrent Neural Networks (RNN/LSTM) or a pre-trained **PEGASUS Architecture** (Explicitly referenced in Topic 5.2/6.5). |
| **Validation** | Quantitative Score Metrics | **Chapter VI: Evaluation (6.6)** | System calculation of ROUGE-1, ROUGE-2, and ROUGE-L metrics compared to user-provided or gold summaries. |
| **Application**| Text Summarization Core | **Chapter VIII: Applications (8.2)** | Full execution of the designated Chapter 8 Application module. |

---

## 3. Product Features & User Stories

### 3.1 Feature Breakdown

#### 1. Elegant Dashboard Screen
- **Landing State:** A clean visual dashboard showing a minimal, structural workspace layout divided into actionable inputs and analytical outputs.
- **Input Channels:** Plain text paste box, file upload utility (.txt, .md), and a mock web scraping input field.

#### 2. Dual-Engine Selector (Extractive vs. Abstractive)
- **Extractive Switch:** Computes an exact extraction summary by picking top-weighted sentences based on *TF-IDF* and sentence metrics (Syllabus Chapter IV).
- **Abstractive Switch:** Leverages a sequence-to-sequence conditional text generator framework (*PEGASUS*) via the HuggingFace API to synthesize rewritten, human-like summaries (Syllabus Chapter VI).

#### 3. Real-Time "NLP Pipeline Inspection Window"
- A slide-out panel that visually displays what the AI engine does at each syllabus phase:
  - *Phase 1:* Tokenized view (Words separated, parts of speech or stop words grayed out).
  - *Phase 2:* Matrix Weighting View (Highlighting words with the highest TF-IDF or embedding scores).

#### 4. Analytics & Evaluation Scoreboard
- Renders side-by-side execution statistics: Compression Ratio %, Inference Latency (ms).
- **Automated ROUGE Evaluation:** Automatically computes ROUGE-1 and ROUGE-L metrics instantly against the original source text upon generation.

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
|  - Neural Inference: Hugging Face Inference API (PEGASUS-xsum)        |
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
- **Architecture:** Pre-trained **PEGASUS Model** configured via Hugging Face Inference API. 
- **Justification:** PEGASUS is explicitly designed for summarization using Gap Sentence Generation (GSG) as a pre-training objective, fitting the sequence-to-sequence generation syllabus requirements.

### 5.3 Step 3: Evaluation Framework (Chapter VI.6 Implementation)
To fulfill the evaluation requirement of Chapter VI, the system includes a scoring utility utilizing the `rouge-score` package to evaluate machine outputs:
- **ROUGE-1:** Measures unigram overlap between the computed summary and an optional reference ground-truth text.
- **ROUGE-L:** Evaluates longest common subsequence (LCS) tracking structural consistency.

---

## 6. UI/UX Design & Frontend Requirements

### 6.1 Theme & Aesthetics (Minimalist Apple-Inspired Design)
- **Color Palette:** 
  - *Canvas Background:* Sleek, low-contrast off-white (`#F7F7F9`).
  - *Cards & Surfaces:* Pure white (`#FFFFFF`) with extremely subtle 1px gray borders and soft diffused drop shadows.
  - *Accents:* Solid dark slate/black (`#111827`) for primary actions, medium grays for secondary labels.
- **Visual Structure:** Ultra-clean minimalist grid layout. A functional 2-column dashboard without heavy background gradients or glassmorphism.

### 6.2 Layout Architecture & UI Components

#### Viewport Area 1: Top Navigation Bar
- **Branding:** Minimalist "Pulsar.AI" or "SensesSum" text with a clean abstract dot logo.
- **Nav Items:** Clean links (Home, Architecture, Syllabus Map).
- **CTA:** Solid dark button for "Book A Call".

#### Viewport Area 2: The Dashboard Grid
- **Left Column (Workspace):** 
  - A clean textarea container for document input.
  - Segmented pill controls for `[ Extractive Matrix ]` | `[ Abstractive PEGASUS ]`.
  - A solid dark `[ Generate ]` action button.
  - Generated Summary output block with inference metrics.
- **Right Column (Analytics):**
  - Statically rendered Pipeline Analytics (Tokens, Sentences, Removed words).
  - Automated ROUGE Evaluation progress bars that animate upon generation.

---

## 7. Functional & Non-Functional Requirements

### 7.1 Functional Requirements
- **FR-1:** System must accept raw text strings ranging from 100 to 5,000 words.
- **FR-2:** System must isolate and display intermediate processing data (token count, removed stop words) in the pipeline inspector view.
- **FR-3:** System must allow downloadable text outputs of the generated summary.

### 7.2 Non-Functional Requirements
- **NFR-1 (Performance):** Baseline extractive summarization should complete in under 150ms; PEGASUS Abstractive summarization via HF Inference API depends on network latency but generally completes in ~1-3 seconds.
- **NFR-2 (Animations & Fluidity):** Page frame rates must maintain a consistent 60fps across web browsers during 3D canvas rendering by optimizing mesh vertex count.
- **NFR-3 (Simplicity & Maintainability):** The backend project code must be clean and un-bloated, isolating standard deep learning wrappers from core procedural python cleaning functions.

---

## 8. Implementation Milestones & Roadmap

- **Milestone 1 (Data & Core NLP Backend):** Script the Chapter II preprocessing steps. Build the native Python Scikit-Learn TF-IDF pipeline and integrate the Hugging Face PEGASUS Inference API into functional FastAPI routes. (Duration: 3 Days)
- **Milestone 2 (Frontend Theme Implementation):** Construct the basic React framework, establishing the minimalist flat card UI and off-white dashboard grid. (Duration: 3 Days)
- **Milestone 3 (Pipeline Validation & Final Polish):** Integrate the automated ROUGE metrics scoreboard, verify rigorous alignment with syllabus topics, and execute debugging passes. (Duration: 2 Days)

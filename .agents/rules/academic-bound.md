---
trigger: manual
---

Core Execution Constraints
Backend Tech Stack: Python 3.10+, FastAPI, NLTK, Scikit-Learn, PyTorch, and Hugging Face Transformers.

Syllabus Baseline Alignment: All text ingestion must route through a dedicated, explicit Python preprocessing script matching Chapter II specifications (manual cleaning, regex sentence/word tokenization, lowercase conversion, and manual stop-word filtering array removal).

Algorithm Boundary: Strictly limit the summarization selection to two manual engine modules:

Extractive Matrix Engine: Uses Scikit-Learn's standard TF-IDF values to rank sentence vectors.

Abstractive Generative Engine: Uses the pre-trained t5-small architecture via Hugging Face pipeline wrappers (as referenced in Topic 5.2 of the syllabus). 

Evaluation Module: Must run an isolated execution of the rouge-score package to print ROUGE and BLEU calculations alongside the generated text summaries for comparison.
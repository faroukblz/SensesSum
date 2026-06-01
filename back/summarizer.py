# ──────────────────────────────────────────────────────────────
# SensesSum – Backend : Summarization Engines
# Syllabus Alignment :
#   • Extractive  → Chapter IV (TF-IDF) & Chapter VI §6.1
#   • Abstractive → Chapter VI §6.4/6.5 (PEGASUS Architecture)
#
# Engine selection is driven by a single `mode` toggle
# parameter ("extractive" | "abstractive") exactly as
# specified in the PRD §5.2.
# ──────────────────────────────────────────────────────────────

import time
import math
from typing import Dict, List

from sklearn.feature_extraction.text import TfidfVectorizer

from preprocessing import clean_text, tokenize_sentences


# ═══════════════════════════════════════════
# Extractive Engine (Scikit-Learn TF-IDF)
# Syllabus Chapters IV & VI.1
# ═══════════════════════════════════════════

def _score_sentences_tfidf(sentences: List[str]) -> List[float]:
    """
    Builds a standard TF-IDF matrix (Scikit-Learn) and scores
    each sentence by the average TF-IDF weight of its terms.

    Formula (PRD §5.2 Option A):
        Score(S_i) = Σ TF-IDF(w, D) / Length(S_i)
    """
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sentences)  # (n_sentences, vocab_size)

    scores: List[float] = []
    for idx in range(tfidf_matrix.shape[0]):
        row = tfidf_matrix.getrow(idx)
        non_zero_count = row.nnz
        if non_zero_count == 0:
            scores.append(0.0)
        else:
            scores.append(float(row.sum()) / non_zero_count)
    return scores


def extractive_summarize(text: str, num_sentences: int = 3) -> Dict:
    """
    Full extractive pipeline:
    1. Clean → sentence-tokenize → TF-IDF matrix → score → pick top-N.
    2. Reorder selected sentences chronologically (PRD §5.2).
    """
    start = time.perf_counter()

    cleaned = clean_text(text)
    sentences = tokenize_sentences(cleaned)

    if len(sentences) <= num_sentences:
        summary = " ".join(sentences)
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "summary": summary,
            "mode": "extractive",
            "selected_indices": list(range(len(sentences))),
            "sentence_scores": [1.0] * len(sentences),
            "inference_time_ms": round(elapsed, 2),
            "original_sentence_count": len(sentences),
            "summary_sentence_count": len(sentences),
            "compression_ratio": 0.0,
        }

    scores = _score_sentences_tfidf(sentences)

    # Pick indices of top-N scoring sentences
    ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    selected = sorted(ranked_indices[:num_sentences])  # chronological reorder

    summary = " ".join(sentences[i] for i in selected)
    elapsed = (time.perf_counter() - start) * 1000

    compression = round(
        (1 - len(summary.split()) / max(len(cleaned.split()), 1)) * 100, 2
    )

    return {
        "summary": summary,
        "mode": "extractive",
        "selected_indices": selected,
        "sentence_scores": [round(s, 4) for s in scores],
        "inference_time_ms": round(elapsed, 2),
        "original_sentence_count": len(sentences),
        "summary_sentence_count": len(selected),
        "compression_ratio": compression,
    }


# ═══════════════════════════════════════════
# Abstractive Engine (PEGASUS via Hugging Face API)
# Syllabus Chapters VI.4 / VI.5.2
# ═══════════════════════════════════════════

def abstractive_summarize(text: str) -> Dict:
    """
    Abstractive summarisation using the PEGASUS transformer
    (google/pegasus-xsum) via the Hugging Face Inference API.
    PEGASUS is purpose-built for abstractive summarisation
    using Gap Sentence Generation (GSG) pre-training.
    """
    import os
    import requests

    start = time.perf_counter()
    cleaned = clean_text(text)

    api_token = os.environ.get("HF_API_TOKEN")
    if not api_token:
        raise ValueError(
            "HF_API_TOKEN environment variable is not set. "
            "Please add it to your environment or Render dashboard."
        )

    api_url = "https://api-inference.huggingface.co/models/google/pegasus-xsum"
    headers = {"Authorization": f"Bearer {api_token}"}
    payload = {
        "inputs": cleaned,
        "parameters": {
            "max_length": 150,
            "min_length": 30,
            "do_sample": False,
        },
        "options": {
            "wait_for_model": True,
        },
    }

    response = requests.post(api_url, headers=headers, json=payload, timeout=120)

    if response.status_code != 200:
        raise RuntimeError(
            f"Hugging Face API Error: {response.status_code} - {response.text}"
        )

    result = response.json()
    if isinstance(result, list) and len(result) > 0 and "summary_text" in result[0]:
        summary = result[0]["summary_text"]
    elif isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
        summary = result[0]["generated_text"]
    elif isinstance(result, dict) and "summary_text" in result:
        summary = result["summary_text"]
    else:
        raise RuntimeError(f"Unexpected response format from HF API: {result}")

    elapsed = (time.perf_counter() - start) * 1000

    word_count_original = len(cleaned.split())
    word_count_summary = len(summary.split())
    compression = round(
        (1 - word_count_summary / max(word_count_original, 1)) * 100, 2
    )

    return {
        "summary": summary,
        "mode": "abstractive",
        "model": "pegasus-xsum (HF API)",
        "inference_time_ms": round(elapsed, 2),
        "original_word_count": word_count_original,
        "summary_word_count": word_count_summary,
        "compression_ratio": compression,
    }


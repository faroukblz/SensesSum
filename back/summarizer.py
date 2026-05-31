# ──────────────────────────────────────────────────────────────
# SensesSum – Backend : Summarization Engines
# Syllabus Alignment :
#   • Extractive  → Chapter IV (TF-IDF) & Chapter VI §6.1
#   • Abstractive → Chapter VI §6.4/6.5 (T5 Architecture)
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
# Abstractive Engine (Hugging Face T5-Small)
# Syllabus Chapters VI.4 / VI.5.2
# ═══════════════════════════════════════════

_t5_model = None      # Lazy-loaded singleton
_t5_tokenizer = None  # Lazy-loaded singleton


def _load_t5():
    """
    Lazily loads the T5-Small model and tokenizer using
    AutoModelForSeq2SeqLM + AutoTokenizer (compatible with
    all transformers versions).  Singleton pattern avoids
    re-downloading on every request.
    """
    global _t5_model, _t5_tokenizer
    if _t5_model is None:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

        _t5_tokenizer = AutoTokenizer.from_pretrained("t5-small")
        _t5_model = AutoModelForSeq2SeqLM.from_pretrained("t5-small")
        
        # Quantize the model dynamically to int8 to save ~70% RAM and speed up CPU inference on Render
        import torch
        _t5_model = torch.quantization.quantize_dynamic(
            _t5_model, {torch.nn.Linear}, dtype=torch.qint8
        )
        
        _t5_model.eval()
    return _t5_model, _t5_tokenizer


def abstractive_summarize(text: str) -> Dict:
    """
    Abstractive summarisation using the T5-Small encoder-decoder
    transformer.  The input is prefixed with "summarize: " as
    mandated by the T5 architecture specification (PRD §5.2 Option B).
    """
    import torch
    torch.set_num_threads(1)

    start = time.perf_counter()

    cleaned = clean_text(text)
    model, tokenizer = _load_t5()

    # T5 prompt prefix as specified in the PRD
    input_text = f"summarize: {cleaned}"

    # Tokenize with truncation for T5's 512-token context window
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=512,
        truncation=True,
    )

    # Generate summary tokens (no gradient computation needed)
    with torch.no_grad():
        output_ids = model.generate(
            inputs.input_ids,
            max_length=150,
            min_length=30,
            num_beams=1,
            do_sample=False,
        )

    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    elapsed = (time.perf_counter() - start) * 1000

    word_count_original = len(cleaned.split())
    word_count_summary = len(summary.split())
    compression = round(
        (1 - word_count_summary / max(word_count_original, 1)) * 100, 2
    )

    return {
        "summary": summary,
        "mode": "abstractive",
        "model": "t5-small",
        "inference_time_ms": round(elapsed, 2),
        "original_word_count": word_count_original,
        "summary_word_count": word_count_summary,
        "compression_ratio": compression,
    }


# ──────────────────────────────────────────────────────────────
# SensesSum – Backend : ROUGE Evaluation Module
# Syllabus Alignment : Chapter VI §6.6 (Evaluation Metrics)
#
# Runs an isolated execution of the `rouge-score` package to
# compute ROUGE-1 and ROUGE-L between a machine-generated
# summary and a user-provided (or gold-standard) reference.
# ──────────────────────────────────────────────────────────────

from typing import Dict
from rouge_score import rouge_scorer


def evaluate_rouge(generated_summary: str, reference_summary: str) -> Dict:
    """
    Computes ROUGE-1 and ROUGE-L scores.

    • ROUGE-1  – Unigram overlap (precision, recall, F1)
    • ROUGE-L  – Longest Common Subsequence metric

    Returns a flat dictionary ready for JSON serialisation.
    """
    scorer = rouge_scorer.RougeScorer(
        ["rouge1", "rougeL"],
        use_stemmer=True,
    )

    scores = scorer.score(reference_summary, generated_summary)

    return {
        "rouge_1": {
            "precision": round(scores["rouge1"].precision, 4),
            "recall": round(scores["rouge1"].recall, 4),
            "f1": round(scores["rouge1"].fmeasure, 4),
        },
        "rouge_l": {
            "precision": round(scores["rougeL"].precision, 4),
            "recall": round(scores["rougeL"].recall, 4),
            "f1": round(scores["rougeL"].fmeasure, 4),
        },
    }

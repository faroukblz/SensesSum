# ──────────────────────────────────────────────────────────────
# SensesSum – Backend : Text Preprocessing Module
# Syllabus Alignment : Chapter II (Text Preprocessing)
#
# All cleaning, tokenization, and stop-word removal is done
# manually via Python `re` and an explicit static stop-word
# list – no external tokeniser libraries are invoked here.
# ──────────────────────────────────────────────────────────────

import re
from typing import Dict, List, Tuple

# ──────────────────────────────────────────
# Static Stop-Word Array (academic requirement:
# transparent, observable, no hidden NLTK data)
# ──────────────────────────────────────────
STOP_WORDS: set = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "yourselves",
    "he", "him", "his", "himself", "she", "her", "hers", "herself",
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those",
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing",
    "a", "an", "the", "and", "but", "if", "or", "because", "as",
    "until", "while", "of", "at", "by", "for", "with", "about",
    "against", "between", "through", "during", "before", "after",
    "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "both",
    "each", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "s", "t", "can", "will", "just", "don", "should", "now",
    "d", "ll", "m", "o", "re", "ve", "y", "ain",
    "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven",
    "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn",
    "wasn", "weren", "won", "wouldn",
}


def clean_text(raw_text: str) -> str:
    """
    Step 1 – Text Cleaning (Chapter II §1)
    Strips markdown markers, HTML tags, and excessive whitespace.
    """
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", raw_text)
    # Remove markdown bold / italic markers
    text = re.sub(r"[*_~`#>]+", " ", text)
    # Remove URLs
    text = re.sub(r"https?://\S+", " ", text)
    # Collapse multiple whitespace / newlines
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize_sentences(text: str) -> List[str]:
    """
    Step 2a – Sentence Tokenization (Chapter II §2)
    Uses explicit regex sentence boundary detection.
    """
    # Split on sentence-ending punctuation followed by whitespace
    sentences = re.split(r"(?<=[.!?])\s+", text)
    # Filter out empty or whitespace-only segments
    return [s.strip() for s in sentences if s.strip()]


def tokenize_words(text: str) -> List[str]:
    """
    Step 2b – Word Tokenization (Chapter II §2)
    Uses explicit regex token boundary pattern.
    """
    return re.findall(r"[a-zA-Z0-9]+", text)


def normalize_tokens(tokens: List[str]) -> List[str]:
    """
    Step 3a – Case Folding / Lowercase Conversion (Chapter II §3)
    """
    return [tok.lower() for tok in tokens]


def remove_stop_words(tokens: List[str]) -> Tuple[List[str], List[str]]:
    """
    Step 3b – Stop-Word Filtering (Chapter II §3)
    Uses the explicit static STOP_WORDS array for transparency.
    Returns (filtered_tokens, removed_stop_words).
    """
    filtered: List[str] = []
    removed: List[str] = []
    for tok in tokens:
        if tok in STOP_WORDS:
            removed.append(tok)
        else:
            filtered.append(tok)
    return filtered, removed


def preprocess_text(raw_text: str) -> Dict:
    """
    Full preprocessing pipeline – orchestrates every step
    and returns a complete token dictionary for the frontend
    Pipeline Inspection Window (PRD §3.1 Feature 3).
    """
    cleaned = clean_text(raw_text)
    sentences = tokenize_sentences(cleaned)
    word_tokens = tokenize_words(cleaned)
    normalised = normalize_tokens(word_tokens)
    filtered, removed = remove_stop_words(normalised)

    return {
        "cleaned_text": cleaned,
        "sentences": sentences,
        "sentence_count": len(sentences),
        "raw_tokens": word_tokens,
        "raw_token_count": len(word_tokens),
        "normalized_tokens": normalised,
        "filtered_tokens": filtered,
        "filtered_token_count": len(filtered),
        "removed_stop_words": removed,
        "removed_stop_word_count": len(removed),
    }

# ──────────────────────────────────────────────────────────────
# SensesSum – FastAPI Application Entry-Point
# ──────────────────────────────────────────────────────────────
# Routes:
#   POST /api/preprocess   → Chapter II text-cleaning pipeline
#   POST /api/summarize    → Toggle: extractive (TF-IDF) | abstractive (T5)
#   POST /api/evaluate     → ROUGE-1 & ROUGE-L scoring
#
# Serves on http://localhost:8000 with CORS enabled for the
# frontend development server.
# ──────────────────────────────────────────────────────────────

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional

from preprocessing import preprocess_text
from summarizer import extractive_summarize, abstractive_summarize
from evaluation import evaluate_rouge

# ─── App Initialisation ──────────────────────────────────────

app = FastAPI(
    title="SensesSum – NLP Summarization API",
    description=(
        "Syllabus-compliant backend for the SensesSum text "
        "summarization platform.  Implements preprocessing "
        "(Chapter II), TF-IDF extractive & T5 abstractive "
        "summarization (Chapters IV/VI), and ROUGE evaluation "
        "(Chapter VI §6.6)."
    ),
    version="1.0.0",
)

# Allow frontend dev servers on common ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Schemas ──────────────────────────────


class PreprocessRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        description="Raw text to preprocess (100–5 000 words recommended).",
    )


class SummarizeRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        description="Raw text to summarize.",
    )
    mode: Literal["extractive", "abstractive"] = Field(
        default="extractive",
        description="Toggle between extractive (TF-IDF) and abstractive (T5-Small).",
    )
    num_sentences: Optional[int] = Field(
        default=3,
        ge=1,
        le=20,
        description="Number of sentences for extractive mode (ignored in abstractive).",
    )


class EvaluateRequest(BaseModel):
    generated_summary: str = Field(
        ...,
        min_length=1,
        description="Machine-generated summary text.",
    )
    reference_summary: str = Field(
        ...,
        min_length=1,
        description="Gold-standard / user-provided reference summary.",
    )


# ─── Health Check ─────────────────────────────────────────────

@app.get("/", tags=["health"])
async def root():
    return {
        "service": "SensesSum API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


# ─── Route 1: /api/preprocess ───────────────────────────────

@app.post("/api/preprocess", tags=["preprocessing"])
async def preprocess(req: PreprocessRequest):
    """
    **Chapter II – Text Preprocessing Pipeline**

    Takes raw text and returns a complete token dictionary
    showing every intermediate step: cleaning → sentence
    tokenization → word tokenization → normalization →
    stop-word filtering.
    """
    try:
        result = preprocess_text(req.text)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─── Route 2: /api/summarize ────────────────────────────────

@app.post("/api/summarize", tags=["summarization"])
async def summarize(req: SummarizeRequest):
    """
    **Chapters IV / VI – Dual-Engine Summarizer**

    Toggle parameter `mode`:
    • `"extractive"` → scores sentences using a manual TF-IDF
      matrix computation (Scikit-Learn).
    • `"abstractive"` → calls the Hugging Face T5-Small model
      with the prefix `"summarize: "`.
    """
    try:
        if req.mode == "extractive":
            result = extractive_summarize(req.text, num_sentences=req.num_sentences)
        else:
            result = abstractive_summarize(req.text)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─── Route 3: /api/evaluate ─────────────────────────────────

@app.post("/api/evaluate", tags=["evaluation"])
async def evaluate(req: EvaluateRequest):
    """
    **Chapter VI §6.6 – ROUGE Evaluation**

    Computes ROUGE-1 and ROUGE-L scores between a
    machine-generated summary and a reference text.
    """
    try:
        result = evaluate_rouge(req.generated_summary, req.reference_summary)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─── Direct Execution ────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

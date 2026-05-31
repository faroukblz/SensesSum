from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

print("Downloading T5-small model for caching...")
AutoTokenizer.from_pretrained("t5-small")
AutoModelForSeq2SeqLM.from_pretrained("t5-small")
print("Download complete.")

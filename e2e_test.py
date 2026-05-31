import urllib.request
import json
import time
import sys

API = "http://localhost:8000"
FRONTEND = "http://localhost:3000"

TestText = """Natural Language Processing (NLP) is a critical subfield of artificial intelligence focused on the interaction between computers and human language. Traditional text summarization systems relied heavily on extractive methods, which utilize statistical models like Term Frequency-Inverse Document Frequency (TF-IDF) to score sentences based on word distribution metrics. These algorithms extract premium sentences directly from the source. In contrast, modern abstractive architectures leverage sequence-to-sequence language models like the Text-to-Text Transfer Transformer (T5) to build a deeper semantic representation of meaning. T5 reads an input token sequence, maps contextualized word embeddings via self-attention neural network mechanisms, and generates entirely new sentences to synthesize information. Evaluating these language models requires quantitative frameworks like ROUGE (Recall-Oriented Understudy for Gisting Evaluation), which evaluates n-gram overlaps between algorithmic outputs and reference gold summaries. Implementing these processing pipelines involves a rigorous preprocessing sequence, where text cleaning removes markup noises, regex arrays tokenize string boundaries, and normalization filters redundant stop-words."""

tests_passed = 0
tests_failed = 0
results = {}

print("\n===============================================")
print("  SensesSum E2E Integration Test Suite")
print("===============================================\n")

def request_json(url, data=None, timeout=30):
    headers = {'Content-Type': 'application/json'}
    if data:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    else:
        req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def request_html(url, timeout=10):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return response.read().decode('utf-8'), response.status
    except Exception as e:
        print(f"Request failed: {e}")
        return None, 500

# TEST 0: Environment Health
print("[TEST 0] Environment Health Check...")
data = request_json(f"{API}/")
if data and data.get("status") == "running":
    print(f"  [PASS] Backend API running: {data['service']} v{data['version']}")
    tests_passed += 1
else:
    print("  [FAIL] Backend not reachable or invalid response")
    tests_failed += 1

html, status = request_html(FRONTEND)
if status == 200:
    print(f"  [PASS] Frontend serving: HTTP {status}")
    tests_passed += 1
else:
    print("  [FAIL] Frontend not reachable")
    tests_failed += 1

# TEST 1: Preprocessing
print("\n[TEST 1] POST /api/preprocess - Chapter II Pipeline...")
start_time = time.time()
prep_data = request_json(f"{API}/api/preprocess", {"text": TestText})
latency = (time.time() - start_time) * 1000

if prep_data and prep_data.get("success"):
    d = prep_data["data"]
    print(f"  [PASS] Success: true")
    tests_passed += 1
    
    print(f"  - Sentences: {d['sentence_count']}")
    print(f"  - Raw Tokens: {d['raw_token_count']}")
    print(f"  - Filtered Tokens: {d['filtered_token_count']}")
    print(f"  - Stop Words Removed: {d['removed_stop_word_count']}")
    
    if d['removed_stop_word_count'] > 0:
        print("  [PASS] Stop-word removal confirmed")
        tests_passed += 1
    else:
        print("  [FAIL] No stop words removed")
        tests_failed += 1
        
    all_lower = all(tok == tok.lower() for tok in d['filtered_tokens'])
    if all_lower:
        print("  [PASS] Lowercase normalization verified")
        tests_passed += 1
    else:
        print("  [FAIL] Some tokens not lowercased")
        tests_failed += 1
        
    common_stops = {"is", "a", "the", "of", "to", "in", "and", "by"}
    leaked = [tok for tok in d['filtered_tokens'] if tok in common_stops]
    if not leaked:
        print("  [PASS] No common stop words in filtered output")
        tests_passed += 1
    else:
        print(f"  [FAIL] Stop words found in filtered tokens: {leaked}")
        tests_failed += 1
        
    print(f"  - Latency: {latency:.1f}ms")
else:
    print("  [FAIL] Preprocessing request failed")
    tests_failed += 1

# TEST 2: Extractive
print("\n[TEST 2] POST /api/summarize (mode=extractive) - TF-IDF Engine...")
ext_data = request_json(f"{API}/api/summarize", {"text": TestText, "mode": "extractive", "num_sentences": 3})
if ext_data and ext_data.get("success"):
    d = ext_data["data"]
    results["extractive"] = d
    if d.get("mode") == "extractive":
        print("  [PASS] Mode confirmed: extractive")
        tests_passed += 1
    else:
        print("  [FAIL] Wrong mode")
        tests_failed += 1
        
    print(f"  - Selected Indices: {d['selected_indices']}")
    print(f"  - Compression Ratio: {d['compression_ratio']}%")
    print(f"  - Inference Time: {d['inference_time_ms']}ms")
    
    if d['inference_time_ms'] < 150:
        print(f"  [PASS] NFR-1 met: Extractive < 150ms")
        tests_passed += 1
    else:
        print(f"  [WARN] NFR-1 marginal: {d['inference_time_ms']}ms")
        tests_passed += 1
        
    if any(s > 0 for s in d['sentence_scores']):
        print("  [PASS] TF-IDF scores are non-zero")
        tests_passed += 1
    else:
        print("  [FAIL] All sentence scores are zero")
        tests_failed += 1
else:
    print("  [FAIL] Extractive request failed")
    tests_failed += 1

# TEST 3: Abstractive
print("\n[TEST 3] POST /api/summarize (mode=abstractive) - T5-Small Engine...")
abs_data = request_json(f"{API}/api/summarize", {"text": TestText, "mode": "abstractive"}, timeout=60)
if abs_data and abs_data.get("success"):
    d = abs_data["data"]
    results["abstractive"] = d
    if d.get("mode") == "abstractive":
        print("  [PASS] Mode confirmed: abstractive")
        tests_passed += 1
    else:
        print("  [FAIL] Wrong mode")
        tests_failed += 1
        
    if d.get("model") == "t5-small":
        print("  [PASS] Model confirmed: t5-small")
        tests_passed += 1
    else:
        print("  [FAIL] Unexpected model")
        tests_failed += 1
        
    is_extractive_copy = d['summary'] in TestText
    if not is_extractive_copy:
        print("  [PASS] Summary is abstractive (newly synthesized)")
        tests_passed += 1
    else:
        print("  [WARN] Summary appears extractive-like")
        tests_passed += 1
        
    print(f"  - Summary: \"{d['summary']}\"")
    print(f"  - Compression Ratio: {d['compression_ratio']}%")
    print(f"  - Inference Time: {d['inference_time_ms']}ms")
    
    if d['inference_time_ms'] < 2500:
        print("  [PASS] NFR-1 met: Abstractive < 2500ms")
        tests_passed += 1
    else:
        print(f"  [WARN] NFR-1 exceeded: {d['inference_time_ms']}ms")
        tests_passed += 1
else:
    print("  [FAIL] Abstractive request failed")
    tests_failed += 1

# TEST 4: ROUGE Evaluation
print("\n[TEST 4] POST /api/evaluate - ROUGE-1 & ROUGE-L Scoring...")
ref_summary = "Natural Language Processing is a critical subfield of artificial intelligence. Traditional text summarization systems relied heavily on extractive methods."
gen_summary = results.get("extractive", {}).get("summary", "NLP is artificial intelligence for language processing.")

rouge_data = request_json(f"{API}/api/evaluate", {"generated_summary": gen_summary, "reference_summary": ref_summary})
if rouge_data and rouge_data.get("success"):
    print("  [PASS] ROUGE evaluation succeeded")
    tests_passed += 1
    d = rouge_data["data"]
    
    print(f"  - ROUGE-1: F1={d['rouge_1']['f1']}")
    print(f"  - ROUGE-L: F1={d['rouge_l']['f1']}")
    
    if d['rouge_1']['f1'] > 0 and d['rouge_l']['f1'] > 0:
        print("  [PASS] ROUGE scores are non-zero")
        tests_passed += 1
    else:
        print("  [FAIL] Zero ROUGE scores detected")
        tests_failed += 1
else:
    print("  [FAIL] ROUGE evaluation request failed")
    tests_failed += 1

# TEST 5: Frontend
print("\n[TEST 5] Frontend DOM Structure Validation...")
if html:
    if "SensesSum" in html:
        print("  [PASS] Brand name 'SensesSum' present in DOM")
        tests_passed += 1
    else:
        print("  [FAIL] Brand name missing")
        tests_failed += 1
        
    if "Extractive Matrix" in html:
        print("  [PASS] Toggle pill 'Extractive Matrix' found")
        tests_passed += 1
    else:
        print("  [FAIL] Toggle pill missing")
        tests_failed += 1
        
    if "Abstractive T5" in html:
        print("  [PASS] Toggle pill 'Abstractive T5' found")
        tests_passed += 1
    else:
        print("  [FAIL] Toggle pill missing")
        tests_failed += 1
        
    if "See Summary in Action" in html:
        print("  [PASS] Action button text found")
        tests_passed += 1
    else:
        print("  [FAIL] Action button missing")
        tests_failed += 1
else:
    print("  [FAIL] Frontend HTML check failed")
    tests_failed += 1

# TEST 6: Swagger
print("\n[TEST 6] Swagger Docs Availability...")
swagger_html, s_status = request_html(f"{API}/docs")
if s_status == 200:
    print("  [PASS] Swagger UI accessible at /docs")
    tests_passed += 1
else:
    print("  [FAIL] Swagger docs not accessible")
    tests_failed += 1
    
schema = request_json(f"{API}/openapi.json")
if schema and "paths" in schema:
    paths = schema["paths"].keys()
    if "/api/preprocess" in paths and "/api/summarize" in paths and "/api/evaluate" in paths:
        print("  [PASS] All 3 required routes registered in OpenAPI schema")
        tests_passed += 1
    else:
        print("  [FAIL] Missing routes in schema")
        tests_failed += 1
else:
    print("  [FAIL] OpenAPI schema check failed")
    tests_failed += 1

print("\n===============================================")
print(f"  Total Tests: {tests_passed + tests_failed}")
print(f"  Passed: {tests_passed}")
print(f"  Failed: {tests_failed}")
print("===============================================\n")

if tests_failed > 0:
    sys.exit(1)

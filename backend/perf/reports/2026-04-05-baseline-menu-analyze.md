# Menu Analyze Baseline

- measuredAt: `2026-04-05`
- label: `baseline-sync-chain`
- endpoint: `POST /api/menu/analyze`
- baseUrl: `http://127.0.0.1:3001`
- image: `ai-server/sample_ocr_dataset/Sample/01.원천데이터/OCR/KC/CT/OCR_KC_C2_000109.jpeg`
- warmup: `1`
- measuredRequests: `4`
- concurrency: `1`

## Environment

- backend: local Node process
- database: Docker MySQL (`127.0.0.1:3307`)
- ai-server: local Python process (`127.0.0.1:8000`)
- note: current implementation is the synchronous upload -> OCR/AI analyze -> Gemini post-process chain

## Result

- successRate: `100%`
- successThroughputRps: `0.39`
- avgMs: `2533.87`
- p95Ms: `3427.74`
- p99Ms: `3427.74`

## Portfolio Notes

- baseline average response time: `2.53s`
- baseline p95 response time: `3.43s`
- baseline throughput: `0.39 req/s`
- after refactoring, rerun the exact same benchmark and compare with `npm.cmd --prefix backend run perf:compare`

# Menu Analyze Benchmark

`POST /api/menu/analyze` 리팩토링 전후를 같은 조건으로 비교하기 위한 성능 측정 가이드입니다.

## 기록할 핵심 지표

- `avgMs`: 성공 요청 기준 평균 응답시간
- `p95Ms`: 상위 95% 구간 응답시간
- `successThroughputRps`: 성공 요청 기준 TPS(req/s)
- `successRate`: 전체 요청 대비 성공률

포트폴리오에는 아래처럼 정리하면 좋습니다.

- `평균 응답시간 00% 개선`
- `p95 응답시간 00% 개선`
- `성공 TPS 00% 증가`
- `성공률 00%p 변화`

## 측정 원칙

- 같은 이미지 파일 사용
- 같은 요청 수 사용
- 같은 동시성 사용
- 같은 서버 환경에서 측정
- 첫 측정 전 warmup 수행
- 리팩토링 전후 모두 같은 조건 유지

## 준비

1. 백엔드, MySQL, AI 서버를 실행합니다.

```powershell
docker compose --env-file docker/env.local -f docker/docker-compose.yml up -d mysql backend ai-server
```

2. 백엔드에서 벤치마크를 실행합니다.

```powershell
npm.cmd --prefix backend run perf:menu-analyze -- --label baseline --iterations 6 --concurrency 2 --warmup 1
```

3. 리팩토링 후 같은 조건으로 다시 실행합니다.

```powershell
npm.cmd --prefix backend run perf:menu-analyze -- --label optimized --iterations 6 --concurrency 2 --warmup 1
```

## 결과 비교

결과 JSON은 로컬 `backend/perf/results/`에 저장됩니다.

```powershell
npm.cmd --prefix backend run perf:compare -- --before backend/perf/results/<baseline>.json --after backend/perf/results/<optimized>.json
```

## 기본 이미지 경로

기본 샘플 이미지는 아래 경로를 사용합니다.

`ai-server/sample_ocr_dataset/Sample/01.원천데이터/OCR/KC/CT/OCR_KC_C2_000109.jpeg`

필요하면 `--image <path>` 또는 `BENCH_IMAGE_PATH`로 다른 이미지를 지정할 수 있습니다.

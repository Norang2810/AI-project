#!/usr/bin/env bash
set -euo pipefail

echo "🧑‍💻 [START] 로컬 개발 환경 실행"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 필수 파일 체크
[ -f "env.local" ] || { echo "❌ env.local 이 없습니다. docker/env.local 를 생성해 주세요."; exit 1; }
[ -f "docker-compose.yml" ] || { echo "❌ docker-compose.yml 이 없습니다."; exit 1; }

# 기존 컨테이너 정리(볼륨 보존)
echo "🧹 기존 컨테이너 정리 (볼륨 보존)"
docker compose --env-file env.local \
  -f docker-compose.yml \
  down

# 빌드 + 기동
echo "🔧 빌드 중..."
docker compose --env-file env.local \
  -f docker-compose.yml \
  build

echo "📦 기동 중..."
docker compose --env-file env.local \
  -f docker-compose.yml \
  up -d

echo "✅ 현재 상태"
docker ps

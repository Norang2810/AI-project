#!/usr/bin/env bash
set -euo pipefail

echo "🚀 [START] sslip.io SSL 환경 실행"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 필수 파일 체크
[ -f "env.prod" ] || { echo "❌ env.prod 가 없습니다. docker/env.prod 를 생성해 주세요."; exit 1; }
[ -f "docker-compose.yml" ] || { echo "❌ docker-compose.yml 이 없습니다."; exit 1; }
[ -f "docker-compose.prod.yml" ] || { echo "❌ docker-compose.prod.yml 이 없습니다."; exit 1; }

echo "⚠️  주의: sslip.io 도메인을 설정해야 합니다!"
echo "📝 다음 파일들에서 'your-app-name.sslip.io'를 실제 도메인으로 변경하세요:"
echo "   - docker/nginx/nginx.conf"
echo "   - docker/nginx/nginx.ssl.conf"
echo "   - docker/nginx/frontend.nginx.conf"
echo ""

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리"
docker compose --env-file env.prod \
  -f docker-compose.yml -f docker-compose.prod.yml \
  down

# 빌드 + 기동
echo "🔧 빌드 중..."
docker compose --env-file env.prod \
  -f docker-compose.yml -f docker-compose.prod.yml \
  build

echo "📦 기동 중..."
docker compose --env-file env.prod \
  -f docker-compose.yml -f docker-compose.prod.yml \
  up -d

echo "✅ 현재 상태"
docker ps

echo ""
echo "🌐 sslip.io 도메인으로 접속하세요: https://52-86-168-253.sslip.io"
echo "✅ 도메인 설정이 완료되었습니다!"

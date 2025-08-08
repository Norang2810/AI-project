#!/bin/bash
echo "🚀 [START] 배포 환경 실행"

# 1. 배포용 환경변수 복사 (경로 안전하게)
cp "$(dirname "$0")/env.prod" "$(dirname "$0")/.env"

# 2. 빌드 및 실행
docker-compose down -v
docker-compose up -d --build

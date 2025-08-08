#!/bin/bash
echo "🚀 [START] 배포 환경 실행"

# 1. 배포용 환경변수 복사 (현재 스크립트 위치 기준)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/env.prod" "$SCRIPT_DIR/.env"

# 2. 빌드 및 실행
docker-compose down -v
docker-compose up -d --build


JWT_SECRET=Yh8v@3$Secret!9qXeT#bNw2^KiPzR&mVu

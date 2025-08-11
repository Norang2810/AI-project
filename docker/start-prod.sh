#!/bin/bash
echo "🚀 [START] 배포 환경 실행"

# 1. 스크립트가 있는 디렉토리 기준으로 이동
cp $(dirname "$0")/env.prod $(dirname "$0")/.env


# 2. 배포용 환경변수 복사
cp ../env.prod .env

# 3. 컨테이너 정리 후 재시작
docker-compose down -v
docker-compose up -d --build

#!/bin/bash

echo "🚀 My Web Project - Docker Compose 시작"
echo "========================================"

# 환경 변수 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. env.example을 복사합니다..."
    cp env.example .env
    echo "📝 .env 파일을 편집하여 API 키를 설정하세요!"
    echo "   - Google Translate (API 키 불필요)"
    echo "   - JWT_SECRET"
fi

# Docker Compose 실행
echo "🐳 Docker Compose로 모든 서비스 시작 중..."
docker-compose up --build

echo "✅ 모든 서비스가 시작되었습니다!"
echo ""
echo "🌐 접속 URL:"
echo "   - 프론트엔드: http://localhost:3000"
echo "   - 백엔드 API: http://localhost:3001"
echo "   - AI 서버: http://localhost:8000"
echo "   - Nginx (프록시): http://localhost:80"
echo ""
echo "📊 서비스 상태 확인:"
echo "   docker-compose ps"
echo ""
echo "🛑 서비스 중지:"
echo "   docker-compose down" 
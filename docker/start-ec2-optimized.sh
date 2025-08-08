#!/bin/bash

echo "🚀 EC2 최적화된 프로젝트 시작..."

# 환경 변수 설정
export DB_PASSWORD="your_secure_password_here"
export JWT_SECRET="your_jwt_secret_here"

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose -f docker-compose-optimized.yml down

# Docker 이미지 정리 (용량 절약)
echo "🗑️ 사용하지 않는 Docker 이미지 정리 중..."
docker system prune -f

# 최적화된 서비스 빌드 및 시작
echo "🔨 최적화된 서비스 빌드 중..."
docker-compose -f docker-compose-optimized.yml build --no-cache

echo "▶️ 서비스 시작 중..."
docker-compose -f docker-compose-optimized.yml up -d

# 서비스 상태 확인
echo "📊 서비스 상태 확인 중..."
sleep 10
docker-compose -f docker-compose-optimized.yml ps

# 리소스 사용량 확인
echo "💾 리소스 사용량:"
docker stats --no-stream

echo "✅ 최적화된 프로젝트가 시작되었습니다!"
echo "🌐 접속 URL:"
echo "   - Frontend: http://your-ec2-ip"
echo "   - Backend API: http://your-ec2-ip:3001"
echo "   - AI Server: http://your-ec2-ip:8000"
echo "   - MySQL: your-ec2-ip:3307"

echo ""
echo "📝 로그 확인:"
echo "   - 전체 로그: docker-compose -f docker-compose-optimized.yml logs -f"
echo "   - AI 서버 로그: docker-compose -f docker-compose-optimized.yml logs -f ai-server"

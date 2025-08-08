#!/bin/bash

echo "🚀 UCUBE AI Project - 96서버 실행 스크립트"
echo "=========================================="

# 백엔드 서버 실행
echo "📦 백엔드 서버 시작 중..."
cd backend
npm install
npm start &
BACKEND_PID=$!
cd ..

# AI 서버 실행
echo "🤖 AI 서버 시작 중..."
cd ai-server
pip install -r requirements.txt
python main.py &
AI_PID=$!
cd ..

# 프론트엔드 서버 실행
echo "🌐 프론트엔드 서버 시작 중..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ 모든 서버가 시작되었습니다!"
echo "🌐 프론트엔드: http://192.168.1.96:3000"
echo "🔧 백엔드 API: http://192.168.1.96:3001"
echo "🤖 AI 서버: http://192.168.1.96:8000"
echo "🗄️ 데이터베이스: 192.168.1.96:3307"

# 서버 종료 함수
cleanup() {
    echo "🛑 서버 종료 중..."
    kill $BACKEND_PID 2>/dev/null
    kill $AI_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Ctrl+C 시그널 처리
trap cleanup SIGINT

# 서버 상태 모니터링
echo "📊 서버 상태 모니터링 중... (Ctrl+C로 종료)"
while true; do
    sleep 10
    echo "⏰ 서버 실행 중... $(date)"
done 
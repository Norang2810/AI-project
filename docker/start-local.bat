@echo off
echo 🚀 로컬 환경으로 애플리케이션을 시작합니다...

REM 환경 변수 파일 복사
copy env.local .env

REM 기존 컨테이너 중지 및 제거
docker-compose down

REM 새로 빌드하고 시작
docker-compose up --build

echo ✅ 로컬 환경 설정으로 애플리케이션이 시작되었습니다.
echo 📱 프론트엔드: http://localhost:3000
echo 🔧 백엔드: http://localhost:3001
echo 🤖 AI 서버: http://localhost:8000 
@echo off
chcp 65001 >nul
echo 🚀 UCUBE AI Project - 96서버 실행 스크립트
echo ==========================================

REM 백엔드 서버 실행
echo 📦 백엔드 서버 시작 중...
cd backend
call npm install
start "Backend Server" cmd /k "npm start"
cd ..

REM AI 서버 실행
echo 🤖 AI 서버 시작 중...
cd ai-server
call pip install -r requirements.txt
start "AI Server" cmd /k "python main.py"
cd ..

REM 프론트엔드 서버 실행
echo 🌐 프론트엔드 서버 시작 중...
cd frontend
call npm install
start "Frontend Server" cmd /k "npm start"
cd ..

echo ✅ 모든 서버가 시작되었습니다!
echo 🌐 프론트엔드: http://192.168.1.96:3000
echo 🔧 백엔드 API: http://192.168.1.96:3001
echo 🤖 AI 서버: http://192.168.1.96:8000
echo 🗄️ 데이터베이스: 192.168.1.96:3307
echo.
echo 📊 각 서버는 별도의 명령 프롬프트 창에서 실행됩니다.
echo 🛑 서버를 종료하려면 각 창을 닫으세요.
pause 
#!/bin/bash

echo "   회사 로컬 환경으로 애플리케이션을 시작합니다..."
echo "================================================"

# 현재 디렉토리 확인
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml 파일을 찾을 수 없습니다."
    echo "   docker 폴더에서 실행해주세요."
    exit 1
fi

# 환경 변수 파일 확인 및 생성
if [ ! -f ".env" ]; then
    echo "   .env 파일이 없습니다. env.company를 복사합니다..."
    cp env.company .env
    echo "⚠️  .env 파일을 편집하여 로컬 DB 설정을 확인하세요!"
    echo "   - DB_HOST=localhost (또는 127.0.0.1)"
    echo "   - DB_PORT=3306"
    echo "   - DB_USER=root"
    echo "   - DB_PASSWORD=your_mysql_password"
    echo ""
    echo "💡 MySQL이 실행 중인지 확인하세요!"
    echo "   - Windows: net start mysql"
    echo "   - macOS: brew services start mysql"
    echo "   - Linux: sudo service mysql start"
    echo ""
    read -p "계속하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 실행을 취소했습니다."
        exit 1
    fi
fi

# 기존 컨테이너 중지 및 제거
echo "🛑 기존 컨테이너를 정리합니다..."
docker-compose down

# 새로 빌드하고 시작
echo "   Docker Compose로 서비스를 시작합니다..."
docker-compose up --build -d

# 서비스 상태 확인
echo ""
echo "⏳ 서비스 시작 대기 중..."
sleep 10

# 서비스 상태 출력
echo ""
echo "📊 서비스 상태:"
docker-compose ps

echo ""
echo "✅ 회사 로컬 환경 설정으로 애플리케이션이 시작되었습니다!"
echo ""
echo "🌐 접속 URL:"
echo "   📱 프론트엔드: http://localhost:3000"
echo "   🔧 백엔드 API: http://localhost:3001"
echo "   🤖 AI 서버: http://localhost:8000"
echo "   🌐 Nginx (프록시): http://localhost:80"
echo ""
echo "   유용한 명령어:"
echo "   📊 서비스 상태 확인: docker-compose ps"
echo "   📝 로그 확인: docker-compose logs -f"
echo "      서비스 중지: docker-compose down"
echo "   🔄 재시작: docker-compose restart"
echo ""
echo "⚠️  문제 해결:"
echo "   - DB 연결 실패: MySQL 실행 상태 및 .env 파일 확인"
echo "   - 포트 충돌: 3000, 3001, 8000, 80 포트 사용 중인지 확인"
echo "   - 권한 문제: Docker Desktop이 실행 중인지 확인"
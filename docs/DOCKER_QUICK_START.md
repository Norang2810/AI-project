# 🐳 Docker Compose 빠른 시작 가이드

## 📋 **개요**
Docker Compose를 사용하면 프론트엔드, 백엔드, AI 서버, MySQL 데이터베이스를 한 번에 실행할 수 있습니다.

## 🚀 **실행 방법**

### **1. 환경 변수 설정**
```bash
cd my-web/docker
cp env.example .env
```

`.env` 파일을 편집하여 다음 값들을 설정하세요:
```env
# Google Translate (무료, API 키 불필요)
# 번역 서비스는 Google Translate를 사용합니다.
JWT_SECRET=your_super_secret_jwt_key_here
```

### **2. Docker Compose 실행**
```bash
# 모든 서비스 한 번에 시작
docker-compose up --build

# 백그라운드에서 실행
docker-compose up -d --build
```

### **3. 서비스 상태 확인**
```bash
# 실행 중인 서비스 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### **4. 서비스 중지**
```bash
# 서비스 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

## 🌐 **접속 URL**

| 서비스 | URL | 설명 |
|--------|-----|------|
| 프론트엔드 | http://localhost:3000 | React 애플리케이션 |
| 백엔드 API | http://localhost:3001 | Node.js API 서버 |
| AI 서버 | http://localhost:8000 | Python FastAPI 서버 |
| Nginx | http://localhost:80 | 리버스 프록시 |

## 📊 **서비스 구성**

### **Frontend (React)**
- 포트: 3000
- 기술: React.js, JavaScript JSX
- 기능: 사용자 인터페이스, 이미지 업로드

### **Backend (Node.js)**
- 포트: 3001
- 기술: Express.js, Sequelize, MySQL
- 기능: API 서버, 인증, 파일 업로드

### **AI Server (Python)**
- 포트: 8000
- 기술: FastAPI, EasyOCR, Google Translate
- 기능: OCR, 번역, 메뉴 분석

### **MySQL Database**
- 포트: 3306
- 데이터베이스: myweb
- 기능: 사용자, 알레르기, 분석 결과 저장

### **Nginx (Reverse Proxy)**
- 포트: 80
- 기능: 요청 라우팅, 정적 파일 서빙

## 🔧 **개발 모드**

### **개별 서비스 실행 (개발용)**
```bash
# AI 서버만 실행
cd my-web/ai-server && python main.py

# 백엔드만 실행
cd my-web/backend && npm start

# 프론트엔드만 실행
cd my-web/frontend && npm start
```

### **Docker Compose 실행 (배포용)**
```bash
# 모든 서비스 통합 실행
cd my-web/docker && docker-compose up
```

## 🐛 **문제 해결**

### **포트 충돌**
```bash
# 사용 중인 포트 확인
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8000

# Docker 컨테이너 재시작
docker-compose restart
```

### **로그 확인**
```bash
# 특정 서비스 로그
docker-compose logs frontend
docker-compose logs backend
docker-compose logs ai-server
```

### **데이터베이스 초기화**
```bash
# MySQL 데이터 초기화
docker-compose down -v
docker-compose up --build
```

## 📝 **주의사항**

1. **번역 서비스**: Google Translate는 API 키가 불필요합니다.
2. **포트 사용**: 3000, 3001, 8000, 3306 포트가 사용됩니다.
3. **Docker 설치**: Docker Desktop이 설치되어 있어야 합니다.
4. **메모리**: AI 서버는 많은 메모리를 사용할 수 있습니다.

## 🎯 **장점**

✅ **한 번에 실행**: 모든 서비스를 한 명령어로 실행  
✅ **환경 일관성**: 개발/배포 환경 통일  
✅ **의존성 관리**: 서비스 간 의존성 자동 처리  
✅ **확장성**: 새로운 서비스 쉽게 추가 가능  
✅ **격리**: 각 서비스가 독립적으로 실행 
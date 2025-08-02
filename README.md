# UCUBE AI Project

알레르기 안전 메뉴 분석 AI 프로젝트

## 🚀 96서버 설정

### 환경 변수 설정

96서버에서 실행하기 위해 다음 환경 변수를 설정하세요:

```bash
# 백엔드 환경 변수 (backend/.env)
NODE_ENV=development
DB_HOST=192.168.1.96
DB_PORT=3307
DB_NAME=myweb
DB_USER=root
DB_PASSWORD=1234
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://192.168.1.96:3000
PORT=3001
AI_SERVER_URL=http://192.168.1.96:8000
```

### 서버 실행 방법

1. **백엔드 서버 실행**
```bash
cd backend
npm install
npm start
```

2. **AI 서버 실행**
```bash
cd ai-server
pip install -r requirements.txt
python main.py
```

3. **프론트엔드 실행**
```bash
cd frontend
npm install
npm start
```

### Docker 실행 (선택사항)

```bash
cd docker
docker-compose up -d
```

## 📁 프로젝트 구조

```
my-web/
├── frontend/          # React 프론트엔드
├── backend/           # Node.js 백엔드
├── ai-server/         # Python AI 서버
├── data/              # 데이터셋
└── docker/            # Docker 설정
```

## 🔧 주요 기능

- 메뉴 이미지 업로드 및 OCR 분석
- 알레르기 정보 관리
- AI 기반 메뉴 분류 및 위험도 분석
- 유사 메뉴 추천

## 🌐 접속 정보

- **프론트엔드**: http://192.168.1.96:3000
- **백엔드 API**: http://192.168.1.96:3001
- **AI 서버**: http://192.168.1.96:8000
- **데이터베이스**: 192.168.1.96:3307

## 📝 API 문서

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 사용자 API
- `POST /api/user/allergies` - 알레르기 정보 저장
- `GET /api/user/allergies` - 알레르기 정보 조회

### 메뉴 API
- `POST /api/menu/analyze` - 메뉴 이미지 분석
- `GET /api/menu/analyses` - 분석 결과 목록

### AI 서버 API
- `POST /analyze-image` - 이미지 분석
- `POST /analyze-menu` - 텍스트 분석
- `GET /find-similar-menus` - 유사 메뉴 검색





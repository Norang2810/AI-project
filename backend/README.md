# Backend

## 개요
Node.js와 Express.js 기반의 백엔드 API 서버입니다.

## 기술 스택
- Node.js
- Express.js
- MongoDB / PostgreSQL
- JWT Authentication
- Multer (파일 업로드)
- CORS

## 프로젝트 구조
```
backend/
├── routes/        # API 라우트 정의
├── controllers/   # 비즈니스 로직 처리
├── services/      # 데이터베이스 서비스
├── models/        # 데이터 모델
├── middleware/    # 미들웨어
├── config/        # 설정 파일
└── README.md
```

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

### 테스트
```bash
npm test
```

## 환경 변수
`.env` 파일을 생성하고 다음 변수들을 설정하세요:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/myweb
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

## API 엔드포인트
- `GET /api/health` - 서버 상태 확인
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/users` - 사용자 목록
- `POST /api/upload` - 파일 업로드

## 개발 가이드
- 라우트는 `routes` 디렉토리에 배치
- 컨트롤러는 `controllers` 디렉토리에 배치
- 데이터베이스 모델은 `models` 디렉토리에 배치
- 미들웨어는 `middleware` 디렉토리에 배치 
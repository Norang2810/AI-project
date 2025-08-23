# Backend

## 개요
Node.js와 Express.js 기반의 백엔드 API 서버입니다.

## 기술 스택
- Node.js
- Express.js
- Mysql
- JWT Authentication
- Multer (파일 업로드)
- CORS

## 프로젝트 구조
```
backend/
├── routes/        # API 라우트 정의
├── models/        # 데이터 모델
├── middleware/    # 미들웨어
├── config/        # 설정 파일
└── README.md
```


## API 엔드포인트
- `GET /api/health` - 서버 상태 확인
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/users` - 사용자 목록
- `POST /api/upload` - 파일 업로드

## 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# JWT 설정
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# 데이터베이스 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=menu_analysis
DB_PORT=3306

# 서버 설정
PORT=3001
NODE_ENV=development

# 카카오 API 설정
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
```

## 개발 가이드
- 라우트는 `routes` 디렉토리에 배치
- 컨트롤러는 `controllers` 디렉토리에 배치
- 데이터베이스 모델은 `models` 디렉토리에 배치
- 미들웨어는 `middleware` 디렉토리에 배치 

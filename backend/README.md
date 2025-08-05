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

## 개발 가이드
- 라우트는 `routes` 디렉토리에 배치
- 컨트롤러는 `controllers` 디렉토리에 배치
- 데이터베이스 모델은 `models` 디렉토리에 배치

- 미들웨어는 `middleware` 디렉토리에 배치 

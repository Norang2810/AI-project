# Frontend

## 개요
React.js 기반의 프론트엔드 애플리케이션입니다.

## 기술 스택
- React.js
- Styled Components / CSS Modules
- React Router
- Axios

## 프로젝트 구조
```
frontend/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── assets/        # 이미지, 폰트 등 정적 파일
│   └── styles/        # 글로벌 스타일
├── public/            # 정적 파일
└── README.md
```

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm start
```

### 빌드
```bash
npm run build
```

### 테스트
```bash
npm test
```

## 환경 변수
`.env` 파일을 생성하고 다음 변수들을 설정하세요:
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AI_SERVER_URL=http://localhost:8000
```

## 개발 가이드
- 컴포넌트는 `src/components`에 배치
- 페이지는 `src/pages`에 배치
- 스타일은 `src/styles`에 배치
- 이미지 등 정적 파일은 `src/assets`에 배치 

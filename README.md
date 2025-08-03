# UCUBE AI Project

알레르기 안전 메뉴 분석 AI 프로젝트

## 🔧 주요 기능

- 메뉴 이미지 업로드 및 OCR 분석
- 알레르기 정보 관리
- AI 기반 메뉴 분류 및 위험도 분석
- 유사 메뉴 추천

## 📁 프로젝트 구조

```
my-web/
├── frontend/          # React 프론트엔드
├── backend/           # Node.js 백엔드
├── ai-server/         # Python AI 서버
├── data/              # 데이터셋
└── docker/            # Docker 설정
```
### Docker 실행

```bash
cd docker
docker-compose up -d
```


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





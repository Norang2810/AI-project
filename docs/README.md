# 알레르기 안전 메뉴 분석 시스템

## 프로젝트 개요
사용자의 알레르기 정보를 바탕으로 메뉴판을 분석하여 안전한 메뉴를 추천하는 시스템입니다.

## 주요 기능
1. **사용자 알레르기 정보 등록**
2. **메뉴판 이미지 업로드**
3. **OCR 텍스트 추출**
4. **Google Translate 번역 연동**
5. **알레르기 성분 비교 분석**
6. **개인별 위험도 시각적 표시**

## 기술 스택
- **Frontend**: React.js, JavaScript JSX
- **Backend**: Node.js, Express.js
- **AI Server**: Python, FastAPI
- **Database**: MySQL 8.0
- **OCR**: EasyOCR (다국어 지원)
- **번역**: Google Translate (무료)
- **ORM**: Sequelize

## 프로젝트 구조
```
my-web/
├── frontend/          # React.js 프론트엔드
├── backend/           # Node.js 백엔드 API
├── ai-server/         # Python FastAPI (OCR/번역)
├── data/              # 메뉴 데이터셋
├── docs/              # 문서
└── docker/            # Docker 설정
```

## 핵심 API 엔드포인트
- `POST /api/menu/upload` - 메뉴판 이미지 업로드
- `POST /ai-server/menu/analyze` - OCR + 번역 + 성분 분석
- `GET /api/menu/analyses` - 분석 결과 조회
- `POST /api/user/allergies` - 알레르기 정보 등록

## 데이터 흐름
1. 사용자 알레르기 정보 등록
2. 메뉴판 이미지 업로드
3. EasyOCR로 텍스트 추출
4. Google Translate로 한글 번역
5. 카페 메뉴 데이터셋과 매칭
6. 알레르기 성분 비교
7. 위험도 시각적 표시

## 시작하기

### 필수 요구사항
- Node.js (v16 이상)
- Python (v3.8 이상)
- MySQL 8.0
- Docker & Docker Compose
- Google Translate (무료, API 키 불필요)

### 설치 및 실행
1. 저장소 클론
```bash
git clone <repository-url>
cd my-web
```

2. 환경 변수 설정
```bash
# .env 파일 생성 (Google Translate는 API 키 불필요)
JWT_SECRET=your_super_secret_jwt_key
DB_HOST=mysql
DB_PORT=3306
DB_NAME=myweb
DB_USER=root
DB_PASSWORD=password
```

3. Docker Compose로 전체 서비스 실행
```bash
docker-compose up -d
```

## 개발 가이드
각 서비스별 상세한 개발 가이드는 해당 디렉토리의 README.md를 참조하세요.

## 라이센스
MIT License 
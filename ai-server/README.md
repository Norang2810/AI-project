# AI Server

## 개요
Python과 FastAPI 기반의 AI 서비스 서버입니다.

## 기술 스택
- Python 3.8+
- FastAPI
- Uvicorn
- TensorFlow / PyTorch
- OpenCV
- NumPy / Pandas

## 프로젝트 구조
```
ai-server/
├── routers/      # API 라우터
├── models/       # AI 모델 및 데이터 모델
├── services/     # AI 서비스 로직
├── utils/        # 유틸리티 함수
└── README.md
```

## 설치 및 실행

### 가상환경 생성 및 활성화
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 의존성 설치
```bash
pip install -r requirements.txt
```

### 개발 서버 실행
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 프로덕션 실행
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 환경 변수
`.env` 파일을 생성하고 다음 변수들을 설정하세요:
```
MODEL_PATH=./models/
API_KEY=your_api_key
DEBUG=True
```

## API 엔드포인트
- `GET /health` - 서버 상태 확인
- `POST /predict` - AI 예측
- `POST /analyze` - 데이터 분석
- `GET /docs` - API 문서 (Swagger UI)

## 개발 가이드
- 라우터는 `routers` 디렉토리에 배치
- AI 모델은 `models` 디렉토리에 배치
- 서비스 로직은 `services` 디렉토리에 배치
- 유틸리티 함수는 `utils` 디렉토리에 배치

## 모델 관리
- 학습된 모델은 `models/` 디렉토리에 저장
- 모델 버전 관리를 위해 날짜별로 폴더 구성 권장 
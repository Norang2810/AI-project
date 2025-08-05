# UCUBE AI Project

알레르기 안전 메뉴 분석 AI 프로젝트



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






## 🧾 Git 커밋 컨벤션 (Git Commit Convention)

우리 팀은 GitHub를 이용해 코드 협업을 진행합니다.  일단이정도 방식으로 진행할거니깐 인지하고계세용 

---

### 기본 용어 정리

| 용어 | 설명 |
|------|------|
| Repository (레포지토리) | 프로젝트 폴더라고 생각하면 됩니다. |
| Commit (커밋) | 코드의 변경사항을 저장하는 기록입니다. |
| Branch (브랜치) | 기능별로 나뉘는 코드의 갈래입니다. |
| Pull Request (PR) | 내가 작업한 브랜치를 합쳐달라고 요청하는 기능입니다. |
| Merge (머지) | 작업한 코드를 하나로 합치는 것 |

---

### 1. 브랜치 규칙

우리는 기능별로 브랜치를 나눠서 작업하고,  
작업이 끝나면 하나의 통합 브랜치(dev)에 합칩니다.

#### 기본 브랜치 종류

| 브랜치 이름 | 용도 |
|-------------|------|
| `main` | 실제 배포용 (함부로 수정하지 않음❗) |
| `develop` | 개발자들이 코드를 합치는 브랜치 |
| `feature/기능이름` | 각자 기능 개발 시 사용하는 브랜치 |

 2. 커밋 메시지 규칙
 ex)   <태그>: <변경한 내용 간단히 작성>  -> ex)git commit -m "feat: 회원가입 폼 UI 추가"

| 태그        | 의미                       
| ----------- | ----------------------------
| `feat:`     | 새로운 기능 추가              
| `fix:`      | 버그 수정                    
| `style:`    | 들여쓰기, 띄어쓰기 등 코드 스타일 수정    
| `refactor:` | 코드 구조 개선 (기능 변화 없음)          
| `chore:`    | 기타 설정 수정 (예: gitignore 수정 등) 





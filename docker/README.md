# Docker 환경 설정

이 프로젝트는 로컬과 회사 환경에서 다른 데이터베이스 설정을 사용할 수 있도록 구성되어 있습니다.

## 환경 설정 파일

- `env.local` - 로컬 개발용 설정 (로컬 MySQL 사용)
- `env.company` - 회사 환경용 설정 (회사 DB 사용)

## 실행 방법

### 로컬 환경 (집에서 개발)

**Linux/Mac:**
```bash
./start-local.sh
```

**Windows:**
```cmd
start-local.bat
```

### 회사 환경

**Linux/Mac:**
```bash
./start-company.sh
```

**Windows:**
```cmd
start-company.bat
```

## 수동 실행

환경 변수 파일을 직접 지정하여 실행할 수도 있습니다:

```bash
# 로컬 환경
cp env.local .env && docker-compose up --build

# 회사 환경
cp env.company .env && docker-compose up --build
```

## 환경별 설정 차이점

### 로컬 환경 (`env.local`)
- DB_HOST: `host.docker.internal` (로컬 MySQL)
- DB_USER: `root`
- DB_PASSWORD: `password`
- NODE_ENV: `development`

### 회사 환경 (`env.company`)
- DB_HOST: `company-db-server` (회사 DB 서버)
- DB_USER: `myweb_user`
- DB_PASSWORD: `company_password`
- NODE_ENV: `production`

## 주의사항

1. **로컬 MySQL 설정**: 로컬 환경을 사용하기 전에 MySQL이 실행 중이고 적절한 권한이 설정되어 있는지 확인하세요.

2. **회사 DB 정보**: `env.company` 파일의 DB 설정을 실제 회사 DB 정보로 수정하세요.

3. **환경 변수 수정**: 필요에 따라 각 환경 파일의 설정을 수정할 수 있습니다.

## 접속 URL

애플리케이션이 시작되면 다음 URL로 접속할 수 있습니다:

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001
- **AI 서버**: http://localhost:8000 
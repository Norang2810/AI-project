# API 명세서

## 개요
My Web Project의 REST API 명세서입니다.

## 기본 정보
- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **인증 방식**: JWT Bearer Token

## 인증 API

### 로그인
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 회원가입
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

## 사용자 API

### 사용자 목록 조회
```
GET /users
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 사용자 상세 조회
```
GET /users/:id
```

## 콘텐츠 API

### 게시물 목록 조회
```
GET /posts
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `category`: 카테고리 필터

### 게시물 생성
```
POST /posts
```

**Request Body:**
```json
{
  "title": "게시물 제목",
  "content": "게시물 내용",
  "category": "general"
}
```

### 게시물 수정
```
PUT /posts/:id
```

### 게시물 삭제
```
DELETE /posts/:id
```

## 파일 업로드 API

### 파일 업로드
```
POST /upload
```

**Content-Type**: `multipart/form-data`

**Request Body:**
```
file: <file>
```

**Response:**
```json
{
  "success": true,
  "filename": "uploaded_file.jpg",
  "url": "/uploads/uploaded_file.jpg"
}
```

## AI 서비스 API

### 이미지 분석
```
POST /ai/analyze-image
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

### 텍스트 분석
```
POST /ai/analyze-text
```

**Request Body:**
```json
{
  "text": "분석할 텍스트 내용"
}
```

## 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

## 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류 
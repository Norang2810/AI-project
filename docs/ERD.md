# ERD (Entity Relationship Diagram) - 알레르기 안전 메뉴 분석 시스템

## 프로젝트 개요
사용자의 알레르기 정보를 바탕으로 메뉴판을 분석하여 안전한 메뉴를 추천하는 시스템입니다.

## 주요 기능
1. **사용자 관리**: 회원가입, 로그인, 알레르기 정보 등록
2. **메뉴 분석**: OCR, 번역, 성분 분석
3. **알레르기 비교**: 사용자 알레르기와 메뉴 성분 비교
4. **결과 표시**: 안전/위험 메뉴 구분 표시
5. **이력 관리**: 분석 결과 저장 및 조회

## 테이블 구조

### 1. users (사용자)
```
users
├── id (PK)
├── email (UNIQUE)
├── password
├── name
├── profile_image
├── role (user/admin)
├── is_active
├── created_at
└── updated_at
```

### 2. allergies (알레르기 정보)
```
allergies
├── id (PK)
├── user_id (FK → users.id)
├── allergy_name (알레르기 원인물)
├── severity (경중도: mild/moderate/severe)
├── notes (추가 설명)
├── is_active
├── created_at
└── updated_at
```

### 3. menu_images (메뉴판 이미지)
```
menu_images
├── id (PK)
├── user_id (FK → users.id)
├── filename
├── original_name
├── file_path
├── file_size
├── upload_date
├── is_processed
├── created_at
└── updated_at
```

### 4. menu_analyses (메뉴 분석 결과)
```
menu_analyses
├── id (PK)
├── menu_image_id (FK → menu_images.id)
├── user_id (FK → users.id)
├── ocr_text (OCR 결과 텍스트)
├── translated_text (번역된 텍스트)
├── ingredients (추출된 성분)
├── analysis_status (processing/completed/error)
├── created_at
└── updated_at
```

### 5. menu_items (메뉴 항목)
```
menu_items
├── id (PK)
├── menu_analysis_id (FK → menu_analyses.id)
├── name (메뉴명)
├── original_name (원본 메뉴명)
├── translated_name (번역된 메뉴명)
├── price
├── description
├── category
├── created_at
└── updated_at
```

### 6. ingredients (성분 정보)
```
ingredients
├── id (PK)
├── menu_item_id (FK → menu_items.id)
├── name (성분명)
├── original_name (원본 성분명)
├── translated_name (번역된 성분명)
├── allergy_risk (none/low/medium/high)
├── created_at
└── updated_at
```

### 7. allergy_warnings (알레르기 경고)
```
allergy_warnings
├── id (PK)
├── user_id (FK → users.id)
├── menu_item_id (FK → menu_items.id)
├── ingredient_id (FK → ingredients.id)
├── allergy_name (알레르기 원인물)
├── severity (경중도)
├── warning_type (danger/warning/safe)
├── created_at
└── updated_at
```

### 8. analysis_sessions (분석 세션)
```
analysis_sessions
├── id (PK)
├── user_id (FK → users.id)
├── session_token
├── menu_image_id (FK → menu_images.id)
├── status (active/completed/expired)
├── created_at
└── updated_at
```

## 관계도

```
users (1) ←→ (N) allergies
users (1) ←→ (N) menu_images
users (1) ←→ (N) menu_analyses
users (1) ←→ (N) allergy_warnings
users (1) ←→ (N) analysis_sessions

menu_images (1) ←→ (1) menu_analyses
menu_analyses (1) ←→ (N) menu_items
menu_items (1) ←→ (N) ingredients

ingredients (N) ←→ (N) allergy_warnings
allergies (N) ←→ (N) allergy_warnings

analysis_sessions (1) ←→ (1) menu_images
```

## 관계 설명

### 1:N 관계
- **User → Allergies**: 한 사용자가 여러 알레르기 정보 등록
- **User → Menu_Images**: 한 사용자가 여러 메뉴판 이미지 업로드
- **User → Menu_Analyses**: 한 사용자가 여러 메뉴 분석 요청
- **User → Allergy_Warnings**: 한 사용자에게 여러 알레르기 경고
- **Menu_Analysis → Menu_Items**: 한 분석에 여러 메뉴 항목
- **Menu_Item → Ingredients**: 한 메뉴에 여러 성분

### 1:1 관계
- **Menu_Image ↔ Menu_Analysis**: 하나의 이미지에 하나의 분석 결과
- **Analysis_Session ↔ Menu_Image**: 하나의 세션에 하나의 이미지

### N:N 관계
- **Ingredients ↔ Allergy_Warnings**: 성분과 알레르기 경고의 다대다 관계

## 인덱스 설계
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_allergies_user_id ON allergies(user_id);
CREATE INDEX idx_menu_images_user_id ON menu_images(user_id);
CREATE INDEX idx_menu_analyses_user_id ON menu_analyses(user_id);
CREATE INDEX idx_menu_items_analysis_id ON menu_items(menu_analysis_id);
CREATE INDEX idx_ingredients_menu_item_id ON ingredients(menu_item_id);
CREATE INDEX idx_allergy_warnings_user_id ON allergy_warnings(user_id);
CREATE INDEX idx_analysis_sessions_user_id ON analysis_sessions(user_id);
```

## API 엔드포인트 설계
```javascript
// 사용자 관리
POST /api/auth/register
POST /api/auth/login
GET /api/auth/logout

// 알레르기 관리
GET /api/allergies
POST /api/allergies
PUT /api/allergies/:id
DELETE /api/allergies/:id

// 메뉴 분석
POST /api/menu/upload
POST /api/menu/analyze
GET /api/menu/analysis/:id

// 결과 조회
GET /api/result/:userId/latest
GET /api/result/:userId/history
GET /api/result/:analysisId/detail

// 세션 관리
POST /api/session/create
GET /api/session/:token
DELETE /api/session/:token
```

## 데이터 무결성
- **CASCADE**: 사용자 삭제 시 관련 데이터 모두 삭제
- **SET NULL**: 메뉴 분석 삭제 시 메뉴 항목은 남기고 분석 ID만 NULL
- **RESTRICT**: 알레르기 정보 삭제 시 경고가 있으면 삭제 불가 
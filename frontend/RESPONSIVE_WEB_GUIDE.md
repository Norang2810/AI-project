# 반응형 웹 구현 가이드

## 개요
이 프로젝트는 모바일, 태블릿, 데스크톱 등 모든 디바이스에서 최적화된 사용자 경험을 제공하는 반응형 웹 애플리케이션입니다.

## 구현된 반응형 기능

### 1. 브레이크포인트
- **데스크톱**: 1024px 이상
- **태블릿**: 768px ~ 1024px
- **모바일**: 480px ~ 768px
- **작은 모바일**: 480px 이하

### 2. 주요 컴포넌트별 반응형 적용

#### Header 컴포넌트
- **데스크톱**: 전체 네비게이션 메뉴 표시
- **모바일**: 햄버거 메뉴로 변경
- **반응형 높이**: 데스크톱 80px, 모바일 60px

#### MainPage 컴포넌트
- **Hero Section**: 화면 크기에 따른 높이 및 폰트 크기 조정
- **CTA Button**: 디바이스별 크기 및 폰트 조정
- **About Grid**: 모바일에서 세로 배치로 변경

#### ImageUpload 컴포넌트
- **업로드 영역**: 디바이스별 패딩 및 폰트 크기 조정
- **이미지 프리뷰**: 화면 크기에 따른 최대 높이 조정
- **버튼**: 터치 친화적인 크기로 조정

#### 공통 컴포넌트
- **Section**: 화면 크기에 따른 패딩 및 높이 조정
- **Card**: 모바일에서 적절한 패딩 및 둥근 모서리 적용
- **Button**: 터치 디바이스에 최적화된 크기

### 3. 모바일 최적화

#### 터치 인터페이스
- 호버 효과 제거 (모바일에서 불필요)
- 터치 친화적인 버튼 크기
- 스와이프 제스처 지원

#### 성능 최적화
- `-webkit-overflow-scrolling: touch` 적용
- `-webkit-tap-highlight-color: transparent` 적용
- 모바일에서 불필요한 애니메이션 제거

## CSS 미디어 쿼리 구조

```css
/* 태블릿 */
@media (max-width: 1024px) {
  /* 태블릿 스타일 */
}

/* 모바일 */
@media (max-width: 768px) {
  /* 모바일 스타일 */
}

/* 작은 모바일 */
@media (max-width: 480px) {
  /* 작은 모바일 스타일 */
}
```

## 유틸리티 클래스

### 표시/숨김 클래스
- `.desktop-only`: 데스크톱에서만 표시
- `.mobile-only`: 모바일에서만 표시

### 사용 예시
```jsx
<div className="desktop-only">데스크톱에서만 보임</div>
<div className="mobile-only">모바일에서만 보임</div>
```

## 도커 환경에서의 반응형 웹

### 설정된 메타 태그
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="format-detection" content="telephone=no" />
```

### 최적화된 CSS
- iOS Safari 최적화
- 터치 디바이스 최적화
- 가로 스크롤 방지

## 테스트 방법

### 1. 브라우저 개발자 도구
- F12 → Device Toolbar
- 다양한 디바이스 해상도로 테스트

### 2. 실제 디바이스 테스트
- 모바일 기기에서 직접 접속
- 태블릿에서 테스트
- 다양한 브라우저에서 테스트

### 3. 반응형 테스트 도구
- Chrome DevTools
- Firefox Responsive Design Mode
- Safari Web Inspector

## 주의사항

### 1. 성능
- 모바일에서 불필요한 애니메이션 제거
- 이미지 최적화
- 폰트 로딩 최적화

### 2. 접근성
- 터치 타겟 크기 최소 44px
- 적절한 색상 대비
- 스크린 리더 지원

### 3. 크로스 브라우저
- 다양한 브라우저에서 테스트
- 벤더 프리픽스 적용
- 폴백 스타일 제공

## 향후 개선 사항

### 1. 고급 반응형 기능
- CSS Grid의 `auto-fit` 활용
- Container Queries 적용
- CSS Custom Properties 활용

### 2. 성능 최적화
- 이미지 lazy loading
- 코드 스플리팅
- 서비스 워커 적용

### 3. 사용자 경험 개선
- 스켈레톤 로딩
- 스무스한 전환 애니메이션
- 제스처 기반 네비게이션

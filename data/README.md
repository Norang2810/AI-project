# 📁 Data Directory

이 폴더는 프로젝트에서 사용하는 모든 데이터 파일들을 포함합니다.

## 📂 폴더 구조

```
data/
├── datasets/           # 데이터셋 파일들
│   └── cafe_menu_dataset.json  # 카페 메뉴 데이터셋 (100개 항목)
├── images/            # 이미지 파일들
│   ├── sample/        # 샘플 이미지
│   └── uploads/       # 업로드된 이미지
└── README.md          # 이 파일
```

## 📊 데이터셋 설명

### cafe_menu_dataset.json
- **용도**: AI 서버의 메뉴 분석 및 알레르기 검사
- **내용**: 100개의 카페 메뉴 항목
- **포함 정보**:
  - 메뉴 이름 (한글/영어)
  - 카테고리 (커피, 차, 주스, 스무디, 밀크셰이크, 초콜릿)
  - 성분 목록
  - 알레르기 정보
  - 설명

### 알레르기 카테고리
- **우유**: 유제품 알레르기 (높은 위험도)
- **초콜릿**: 초콜릿 알레르기 (중간 위험도)
- **헤이즐넛**: 견과류 알레르기 (높은 위험도)
- **아몬드**: 견과류 알레르기 (높은 위험도)
- **밀**: 글루텐 알레르기 (높은 위험도)

## 🖼️ 이미지 폴더

### sample/
- 테스트용 샘플 메뉴 이미지들
- OCR 테스트 및 개발용

### uploads/
- 사용자가 업로드한 메뉴 이미지들
- 분석 후 결과와 함께 저장

## 🔄 데이터 업데이트

새로운 메뉴나 알레르기 정보를 추가할 때는:
1. `datasets/cafe_menu_dataset.json` 파일 수정
2. AI 서버의 분석 로직 테스트
3. 프론트엔드에서 새로운 알레르기 옵션 추가

## 📝 사용법

### AI 서버에서 데이터셋 사용
```python
# 데이터셋 로드
with open('data/datasets/cafe_menu_dataset.json', 'r', encoding='utf-8') as f:
    menu_data = json.load(f)

# 메뉴 분석
for menu_item in menu_data['cafe_beverages']:
    # 분석 로직
    pass
```

### 알레르기 정보 확인
```python
# 알레르기 카테고리 확인
allergen_categories = menu_data['allergen_categories']
for allergen, info in allergen_categories.items():
    print(f"{allergen}: {info['description']} (위험도: {info['severity']})")
``` 
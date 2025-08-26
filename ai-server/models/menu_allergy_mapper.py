import json
import re
from typing import List, Dict, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

class MenuAllergyMapper:
    """메뉴명과 알레르기 성분을 동적으로 매핑하는 모델"""
    
    def __init__(self):
        self.menu_database = self._load_menu_database()
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=1000,
            stop_words=None
        )
        self.menu_vectors = None
        self._build_vectors()
        logger.info("✅ 메뉴-알레르기 매퍼 초기화 완료")
    
    def _load_menu_database(self) -> Dict:
        """카페 메뉴 데이터베이스 로드"""
        return {
            # 우유 포함 메뉴
            "우유": [
                "latte", "라떼", "cappuccino", "카푸치노", "mocha", "모카",
                "macchiato", "마끼아또", "flat white", "플랫 화이트",
                "cortado", "코르타도", "con panna", "콘 파나",
                "white coffee", "화이트 커피", "milk coffee", "밀크 커피",
                "caramel latte", "카라멜 라떼", "vanilla latte", "바닐라 라떼",
                "hazelnut latte", "헤이즐넛 라떼", "cinnamon latte", "시나몬 라떼"
            ],
            
            # 아몬드 포함 메뉴
            "아몬드": [
                "almond latte", "아몬드 라떼", "almond milk", "아몬드 밀크",
                "almond cappuccino", "아몬드 카푸치노", "almond mocha", "아몬드 모카",
                "almond flat white", "아몬드 플랫 화이트"
            ],
            
            # 대두 포함 메뉴  
            "대두(콩)": [
                "soy latte", "두유 라떼", "soy milk", "두유", "soy cappuccino",
                "두유 카푸치노", "soy mocha", "두유 모카", "soy flat white",
                "두유 플랫 화이트", "soy americano", "두유 아메리카노"
            ],
            
            # 귀리 포함 메뉴
            "귀리": [
                "oat latte", "귀리 라떼", "oat milk", "귀리 밀크",
                "oat cappuccino", "귀리 카푸치노", "oat mocha", "귀리 모카",
                "oat flat white", "귀리 플랫 화이트", "oat americano", "귀리 아메리카노"
            ],
            
            # 계란 포함 메뉴
            "계란": [
                "egg coffee", "계란 커피", "custard", "커스타드",
                "tiramisu", "티라미수", "cream", "크림", "egg nog", "에그노그"
            ],
            
            # 밀 포함 메뉴
            "밀": [
                "bread", "빵", "cookie", "쿠키", "cake", "케이크",
                "pastry", "페이스트리", "sandwich", "샌드위치", "croissant", "크루아상"
            ],
            
            # 우유 없는 메뉴 (안전)
            "안전": [
                "americano", "아메리카노", "espresso", "에스프레소",
                "drip coffee", "드립 커피", "pour over", "핸드드립",
                "cold brew", "콜드브루", "filter coffee", "필터 커피",
                "black coffee", "블랙 커피", "long black", "롱 블랙",
                "ristretto", "리스레또", "lungo", "룽고", "doppio", "도피오"
            ]
        }
    
    def _build_vectors(self):
        """메뉴 벡터 구축"""
        all_menus = []
        for category, menus in self.menu_database.items():
            for menu in menus:
                all_menus.append({"menu": menu, "category": category})
        
        # 빈 데이터베이스 체크
        if not all_menus:
            logger.error("❌ 메뉴 데이터베이스가 비어있습니다")
            return
        
        try:
            self.menu_vectors = self.vectorizer.fit_transform([item["menu"] for item in all_menus])
            logger.info(f"✅ {len(all_menus)}개 메뉴 벡터 구축 완료")
        except Exception as e:
            logger.error(f"❌ 메뉴 벡터 구축 실패: {e}")
            self.menu_vectors = None
    
    def map_menu_to_allergens(self, menu_text: str) -> Dict:
        """메뉴 텍스트를 알레르기 성분으로 매핑"""
        
        if self.menu_vectors is None:
            return {
                "원본텍스트": menu_text,
                "정제된메뉴명": menu_text,
                "알레르기성분": [],
                "신뢰도": 0.0,
                "카테고리": "알 수 없음"
            }
        
        try:
            # 1. 텍스트 전처리
            processed_text = self._preprocess_text(menu_text)
            
            # 2. 가장 유사한 메뉴 찾기
            best_match = self._find_best_match(processed_text)
            
            # 3. 알레르기 성분 결정
            allergens = self._determine_allergens(best_match)
            
            return {
                "원본텍스트": menu_text,
                "정제된메뉴명": best_match["menu"],
                "알레르기성분": allergens,
                "신뢰도": best_match["confidence"],
                "카테고리": best_match["category"]
            }
        except Exception as e:
            logger.error(f"❌ 메뉴 매핑 실패: {e}")
            return {
                "원본텍스트": menu_text,
                "정제된메뉴명": menu_text,
                "알레르기성분": [],
                "신뢰도": 0.0,
                "카테고리": "오류"
            }
    
    def _preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        # 소문자 변환, 특수문자 제거
        text = text.lower().strip()
        text = re.sub(r'[^\w\s가-힣]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text
    
    def _find_best_match(self, text: str) -> Dict:
        """가장 유사한 메뉴 찾기"""
        
        try:
            # 입력 텍스트 벡터화
            text_vector = self.vectorizer.transform([text])
            
            # 코사인 유사도 계산
            similarities = cosine_similarity(text_vector, self.menu_vectors).flatten()
            
            # 가장 유사한 인덱스 찾기
            best_idx = np.argmax(similarities)
            best_similarity = similarities[best_idx]
            
            # 해당 메뉴의 카테고리 찾기
            all_menus = []
            for category, menus in self.menu_database.items():
                for menu in menus:
                    all_menus.append({"menu": menu, "category": category})
            
            best_match = all_menus[best_idx]
            best_match["confidence"] = float(best_similarity)
            
            return best_match
        except Exception as e:
            logger.error(f"❌ 최적 매칭 실패: {e}")
            return {"menu": text, "category": "알 수 없음", "confidence": 0.0}
    
    def _determine_allergens(self, match: Dict) -> List[str]:
        """매칭된 메뉴의 알레르기 성분 결정"""
        
        category = match["category"]
        
        if category == "안전":
            return []
        else:
            return [category]
    
    def batch_process(self, menu_texts: List[str]) -> List[Dict]:
        """여러 메뉴 텍스트 일괄 처리"""
        results = []
        for text in menu_texts:
            if text.strip():  # 빈 텍스트 제외
                result = self.map_menu_to_allergens(text)
                results.append(result)
        return results
    
    def get_model_status(self) -> Dict:
        """모델 상태 정보 반환"""
        return {
            "menu_database_size": sum(len(menus) for menus in self.menu_database.values()),
            "vectorizer_ready": self.menu_vectors is not None,
            "categories": list(self.menu_database.keys())
        }

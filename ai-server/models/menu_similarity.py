import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import json
import re
from typing import List, Dict, Tuple

class MenuSimilarityModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 3),
            min_df=1,
            stop_words=None
        )
        self.menu_data = []
        self.menu_vectors = None
        self.model_path = 'models/menu_similarity.pkl'
        self.vectorizer_path = 'models/menu_similarity_vectorizer.pkl'
        
    def preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        # 한글, 영어, 숫자만 남기고 제거
        text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
        # 공백 정리
        text = re.sub(r'\s+', ' ', text).strip()
        return text.lower()
    
    def load_menu_data(self):
        """메뉴 데이터 로드"""
        with open('data/datasets/cafe_menu_dataset.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        menu_texts = []
        menu_info = []
        
        for menu in data['cafe_beverages']:
            # 메뉴명과 변형명들을 모두 포함
            menu_texts.append(menu['name'])
            menu_info.append({
                'id': menu['id'],
                'name': menu['name'],
                'category': menu['category'],
                'ingredients': menu.get('ingredients', []),
                'allergens': menu.get('allergens', [])
            })
            
            # 변형명들도 추가
            for variation in menu.get('variations', []):
                if variation != menu['name']:  # 중복 제거
                    menu_texts.append(variation)
                    menu_info.append({
                        'id': menu['id'],
                        'name': variation,
                        'category': menu['category'],
                        'ingredients': menu.get('ingredients', []),
                        'allergens': menu.get('allergens', [])
                    })
        
        return menu_texts, menu_info
    
    def train(self):
        """모델 훈련"""
        print("메뉴 유사도 모델 훈련 시작...")
        
        # 데이터 로드
        menu_texts, self.menu_data = self.load_menu_data()
        
        if len(menu_texts) < 10:
            print("훈련 데이터가 부족합니다.")
            return False
        
        # 텍스트 전처리
        processed_texts = [self.preprocess_text(text) for text in menu_texts]
        
        # TF-IDF 벡터화
        self.menu_vectors = self.vectorizer.fit_transform(processed_texts)
        
        # 모델 저장
        joblib.dump(self.vectorizer, self.vectorizer_path)
        
        print(f"모델이 {self.vectorizer_path}에 저장되었습니다.")
        print(f"총 {len(menu_texts)}개의 메뉴 텍스트로 훈련 완료")
        return True
    
    def load_model(self):
        """저장된 모델 로드"""
        try:
            self.vectorizer = joblib.load(self.vectorizer_path)
            _, self.menu_data = self.load_menu_data()
            return True
        except FileNotFoundError:
            print("저장된 모델을 찾을 수 없습니다. 모델을 훈련해주세요.")
            return False
    
    def find_similar_menus(self, query: str, top_k: int = 5) -> List[Dict]:
        """유사한 메뉴 찾기"""
        if self.menu_vectors is None:
            if not self.load_model():
                return []
        
        # 쿼리 텍스트 전처리 및 벡터화
        processed_query = self.preprocess_text(query)
        query_vector = self.vectorizer.transform([processed_query])
        
        # 코사인 유사도 계산
        similarities = cosine_similarity(query_vector, self.menu_vectors).flatten()
        
        # 상위 k개 결과 반환
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # 최소 유사도 임계값
                results.append({
                    'menu': self.menu_data[idx],
                    'similarity': float(similarities[idx]),
                    'rank': len(results) + 1
                })
        
        return results
    
    def find_menus_by_ingredient(self, ingredient: str, top_k: int = 10) -> List[Dict]:
        """특정 성분이 포함된 메뉴 찾기"""
        if not self.menu_data:
            if not self.load_model():
                return []
        
        results = []
        for menu in self.menu_data:
            if ingredient in menu['ingredients']:
                results.append({
                    'menu': menu,
                    'ingredient_match': ingredient,
                    'ingredient_count': len([i for i in menu['ingredients'] if ingredient in i])
                })
        
        # 성분 매칭 개수로 정렬
        results.sort(key=lambda x: x['ingredient_count'], reverse=True)
        return results[:top_k]
    
    def find_safe_menus(self, user_allergies: List[str], top_k: int = 10) -> List[Dict]:
        """사용자 알레르기에 안전한 메뉴 찾기"""
        if not self.menu_data:
            if not self.load_model():
                return []
        
        safe_menus = []
        for menu in self.menu_data:
            # 알레르기 성분이 없는 메뉴만 선택
            has_allergen = any(allergen in menu['allergens'] for allergen in user_allergies)
            if not has_allergen:
                safe_menus.append({
                    'menu': menu,
                    'safety_score': 1.0,
                    'reason': '알레르기 성분 없음'
                })
        
        return safe_menus[:top_k]
    
    def get_menu_suggestions(self, query: str, user_allergies: List[str] = None) -> Dict:
        """메뉴 추천 (유사도 + 안전성 고려)"""
        similar_menus = self.find_similar_menus(query, top_k=10)
        
        if user_allergies:
            # 안전한 메뉴만 필터링
            safe_similar = []
            for item in similar_menus:
                menu = item['menu']
                has_allergen = any(allergen in menu['allergens'] for allergen in user_allergies)
                if not has_allergen:
                    safe_similar.append({
                        **item,
                        'safety': 'safe'
                    })
                else:
                    safe_similar.append({
                        **item,
                        'safety': 'warning',
                        'allergens_found': [a for a in user_allergies if a in menu['allergens']]
                    })
            
            return {
                'query': query,
                'suggestions': safe_similar,
                'total_found': len(safe_similar),
                'safe_count': len([s for s in safe_similar if s['safety'] == 'safe'])
            }
        else:
            return {
                'query': query,
                'suggestions': similar_menus,
                'total_found': len(similar_menus)
            }

# 사용 예시
if __name__ == "__main__":
    similarity_model = MenuSimilarityModel()
    
    # 모델 훈련
    similarity_model.train()
    
    # 유사한 메뉴 찾기
    similar = similarity_model.find_similar_menus("라떼", top_k=3)
    print("\n'라떼'와 유사한 메뉴:")
    for item in similar:
        print(f"  {item['menu']['name']} (유사도: {item['similarity']:.3f})")
    
    # 성분 기반 검색
    milk_menus = similarity_model.find_menus_by_ingredient("우유", top_k=3)
    print("\n'우유'가 포함된 메뉴:")
    for item in milk_menus:
        print(f"  {item['menu']['name']}")
    
    # 안전한 메뉴 찾기
    safe_menus = similarity_model.find_safe_menus(["우유"], top_k=3)
    print("\n'우유' 알레르기가 있는 사용자를 위한 안전한 메뉴:")
    for item in safe_menus:
        print(f"  {item['menu']['name']}") 
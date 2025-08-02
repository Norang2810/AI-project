import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import json
import re
from typing import List, Dict, Tuple, Set

class IngredientMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            min_df=1
        )
        self.ingredient_synonyms = {}
        self.ingredient_categories = {}
        self.model_path = 'models/ingredient_matcher.pkl'
        self.vectorizer_path = 'models/ingredient_vectorizer.pkl'
        
    def load_ingredient_data(self):
        """성분 데이터 로드 및 동의어 설정"""
        with open('data/datasets/cafe_menu_dataset.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 알레르기 카테고리별 성분 매핑
        self.ingredient_categories = data.get('allergen_categories', {})
        
        # 성분 동의어 설정
        self.ingredient_synonyms = {
            # 유제품
            '우유': ['milk', 'dairy', 'milk', '우유', '밀크', 'latte', '라떼', 'cappuccino', '카푸치노', 'mocha', '모카', 'hot chocolate', '핫초코'],
            '크림': ['cream', '크림', '휘핑크림', 'whipped cream'],
            '버터': ['butter', '버터'],
            '치즈': ['cheese', '치즈', 'cream cheese'],
            '요거트': ['yogurt', '요거트', '요구르트'],
            
            # 견과류
            '헤이즐넛': ['hazelnut', '헤이즐넛', '헤즐넛'],
            '아몬드': ['almond', '아몬드'],
            '땅콩': ['peanut', '땅콩'],
            '호두': ['walnut', '호두'],
            '캐슈넛': ['cashew', '캐슈넛'],
            
            # 글루텐
            '밀': ['wheat', '밀', '밀가루', 'croissant', '크로아상', 'muffin', '머핀', 'cookie', '쿠키', 'cake', '케이크', 'bread', '빵', '토스트'],
            '보리': ['barley', '보리'],
            '호밀': ['rye', '호밀'],
            '오트밀': ['oat', '오트밀'],
            
            # 초콜릿
            '초콜릿': ['chocolate', '초콜릿', '초코'],
            '코코아': ['cocoa', '코코아'],
            '카카오': ['cacao', '카카오'],
            
            # 계란
            '계란': ['egg', '계란', '에그', 'croissant', '크로아상', 'muffin', '머핀', 'cookie', '쿠키', 'cake', '케이크'],
            '계란 흰자': ['egg white', '계란 흰자'],
            '계란 노른자': ['egg yolk', '계란 노른자'],
            
            # 해산물
            '새우': ['shrimp', '새우'],
            '게': ['crab', '게'],
            '조개': ['shellfish', '조개'],
            '오징어': ['squid', '오징어'],
            
            # 과일
            '딸기': ['strawberry', '딸기'],
            '키위': ['kiwi', '키위'],
            '망고': ['mango', '망고'],
            '복숭아': ['peach', '복숭아'],
            '사과': ['apple', '사과'],
            '오렌지': ['orange', '오렌지'],
            '레몬': ['lemon', '레몬'],
            '라임': ['lime', '라임'],
            '블루베리': ['blueberry', '블루베리'],
            '바나나': ['banana', '바나나'],
            
            # 기타
            '설탕': ['sugar', '설탕', '슈가'],
            '꿀': ['honey', '꿀'],
            '시럽': ['syrup', '시럽'],
            '얼음': ['ice', '얼음'],
            '물': ['water', '물'],
            '에스프레소': ['espresso', '에스프레소'],
            '커피 원두': ['coffee bean', '커피 원두', '원두']
        }
        
        return data
    
    def preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text.lower()
    
    def find_ingredient_synonyms(self, ingredient: str) -> List[str]:
        """성분의 동의어 찾기"""
        for main_ingredient, synonyms in self.ingredient_synonyms.items():
            if ingredient.lower() in [s.lower() for s in synonyms]:
                return synonyms
        return [ingredient]
    
    def normalize_ingredient(self, ingredient: str) -> str:
        """성분명 정규화"""
        ingredient_lower = ingredient.lower()
        
        for main_ingredient, synonyms in self.ingredient_synonyms.items():
            if ingredient_lower in [s.lower() for s in synonyms]:
                return main_ingredient
        
        return ingredient
    
    def extract_ingredients_from_text(self, text: str) -> List[str]:
        """텍스트에서 성분 추출"""
        text = self.preprocess_text(text)
        found_ingredients = []
        
        for main_ingredient, synonyms in self.ingredient_synonyms.items():
            for synonym in synonyms:
                if synonym.lower() in text:
                    found_ingredients.append(main_ingredient)
                    break
        
        return list(set(found_ingredients))
    
    def match_ingredients(self, query_ingredients: List[str], target_ingredients: List[str]) -> Dict:
        """성분 매칭 및 유사도 계산"""
        # 정규화
        normalized_query = [self.normalize_ingredient(i) for i in query_ingredients]
        normalized_target = [self.normalize_ingredient(i) for i in target_ingredients]
        
        # 직접 매칭
        direct_matches = set(normalized_query) & set(normalized_target)
        
        # 동의어 매칭
        synonym_matches = []
        for query_ingredient in normalized_query:
            synonyms = self.find_ingredient_synonyms(query_ingredient)
            for target_ingredient in normalized_target:
                target_synonyms = self.find_ingredient_synonyms(target_ingredient)
                if set(synonyms) & set(target_synonyms):
                    synonym_matches.append((query_ingredient, target_ingredient))
        
        # 매칭 점수 계산
        total_query = len(normalized_query)
        total_target = len(normalized_target)
        
        if total_query == 0 or total_target == 0:
            return {
                'match_score': 0.0,
                'direct_matches': [],
                'synonym_matches': [],
                'coverage': 0.0
            }
        
        direct_score = len(direct_matches) / max(total_query, total_target)
        synonym_score = len(set([m[0] for m in synonym_matches])) / max(total_query, total_target)
        
        total_score = (direct_score + synonym_score) / 2
        coverage = len(direct_matches) / total_query if total_query > 0 else 0
        
        return {
            'match_score': total_score,
            'direct_matches': list(direct_matches),
            'synonym_matches': synonym_matches,
            'coverage': coverage,
            'total_query': total_query,
            'total_target': total_target
        }
    
    def find_ingredients_by_category(self, category: str) -> List[str]:
        """카테고리별 성분 찾기"""
        if category in self.ingredient_categories:
            return self.ingredient_categories[category].get('ingredients', [])
        return []
    
    def check_allergy_risk(self, ingredients: List[str], user_allergies: List[str]) -> Dict:
        """알레르기 위험도 체크"""
        risk_found = []
        safe_ingredients = []
        
        for ingredient in ingredients:
            normalized_ingredient = self.normalize_ingredient(ingredient)
            
            # 사용자 알레르기와 매칭
            is_risky = False
            for allergy in user_allergies:
                normalized_allergy = self.normalize_ingredient(allergy)
                
                # 직접 매칭
                if normalized_ingredient == normalized_allergy:
                    risk_found.append({
                        'ingredient': ingredient,
                        'allergy': allergy,
                        'match_type': 'direct'
                    })
                    is_risky = True
                    break
                
                # 동의어 매칭
                ingredient_synonyms = self.find_ingredient_synonyms(normalized_ingredient)
                allergy_synonyms = self.find_ingredient_synonyms(normalized_allergy)
                
                if set(ingredient_synonyms) & set(allergy_synonyms):
                    risk_found.append({
                        'ingredient': ingredient,
                        'allergy': allergy,
                        'match_type': 'synonym'
                    })
                    is_risky = True
                    break
            
            if not is_risky:
                safe_ingredients.append(ingredient)
        
        # 위험도 계산
        total_ingredients = len(ingredients)
        risky_count = len(risk_found)
        risk_ratio = risky_count / total_ingredients if total_ingredients > 0 else 0
        
        # 위험도 레벨 결정
        if risk_ratio == 0:
            risk_level = 'safe'
        elif risk_ratio < 0.3:
            risk_level = 'low_risk'
        elif risk_ratio < 0.7:
            risk_level = 'high_risk'
        else:
            risk_level = 'dangerous'
        
        return {
            'risk_level': risk_level,
            'risk_ratio': risk_ratio,
            'risky_ingredients': risk_found,
            'safe_ingredients': safe_ingredients,
            'total_ingredients': total_ingredients,
            'risky_count': risky_count
        }
    
    def get_ingredient_suggestions(self, partial_ingredient: str, top_k: int = 5) -> List[str]:
        """성분명 자동완성"""
        suggestions = []
        partial_lower = partial_ingredient.lower()
        
        for main_ingredient, synonyms in self.ingredient_synonyms.items():
            # 메인 성분명 매칭
            if partial_lower in main_ingredient.lower():
                suggestions.append(main_ingredient)
            
            # 동의어 매칭
            for synonym in synonyms:
                if partial_lower in synonym.lower():
                    suggestions.append(main_ingredient)
                    break
        
        return list(set(suggestions))[:top_k]

# 사용 예시
if __name__ == "__main__":
    matcher = IngredientMatcher()
    matcher.load_ingredient_data()
    
    # 성분 매칭 테스트
    query_ingredients = ["우유", "초콜릿 시럽"]
    target_ingredients = ["milk", "chocolate syrup", "에스프레소"]
    
    match_result = matcher.match_ingredients(query_ingredients, target_ingredients)
    print(f"매칭 점수: {match_result['match_score']:.3f}")
    print(f"직접 매칭: {match_result['direct_matches']}")
    
    # 알레르기 위험도 체크
    ingredients = ["우유", "초콜릿", "에스프레소"]
    user_allergies = ["우유", "초콜릿"]
    
    risk_result = matcher.check_allergy_risk(ingredients, user_allergies)
    print(f"위험도: {risk_result['risk_level']}")
    print(f"위험 성분: {risk_result['risky_ingredients']}")
    
    # 성분 자동완성
    suggestions = matcher.get_ingredient_suggestions("우")
    print(f"자동완성: {suggestions}") 
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib
import json
import re
from typing import Dict, List, Optional

class AllergyRiskPredictor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            min_df=1
        )
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10
        )
        self.model_path = 'models/allergy_risk_predictor.pkl'
        self.vectorizer_path = 'models/allergy_risk_vectorizer.pkl'
        
    def preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text.lower()
    
    def create_training_data(self):
        """훈련 데이터 생성"""
        with open('data/datasets/cafe_menu_dataset.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        training_data = []
        
        # 알레르기 카테고리별 위험도 매핑
        allergen_categories = data.get('allergen_categories', {})
        
        for menu in data['cafe_beverages']:
            ingredients = menu.get('ingredients', [])
            allergens = menu.get('allergens', [])
            
            # 각 알레르기 카테고리에 대해 훈련 데이터 생성
            for category_key, category_info in allergen_categories.items():
                category_ingredients = category_info.get('ingredients', [])
                severity = category_info.get('severity', 'medium')
                
                # 해당 카테고리의 성분이 메뉴에 포함되어 있는지 확인
                has_allergen = any(ingredient in ingredients for ingredient in category_ingredients)
                
                # 훈련 데이터 생성
                for ingredient in category_ingredients:
                    # 성분이 포함된 경우
                    if ingredient in ingredients:
                        training_data.append({
                            'ingredients': ingredients,
                            'allergen': ingredient,
                            'risk_level': severity,
                            'text': ' '.join(ingredients)
                        })
                    
                    # 성분이 포함되지 않은 경우 (안전한 케이스)
                    else:
                        training_data.append({
                            'ingredients': ingredients,
                            'allergen': ingredient,
                            'risk_level': 'safe',
                            'text': ' '.join(ingredients)
                        })
        
        return training_data
    
    def train(self):
        """모델 훈련"""
        print("알레르기 위험도 예측 모델 훈련 시작...")
        
        # 훈련 데이터 생성
        training_data = self.create_training_data()
        
        if len(training_data) < 50:
            print("훈련 데이터가 부족합니다.")
            return False
        
        # 텍스트와 라벨 분리
        texts = [item['text'] for item in training_data]
        labels = [item['risk_level'] for item in training_data]
        
        # 텍스트 전처리
        processed_texts = [self.preprocess_text(text) for text in texts]
        
        # TF-IDF 벡터화
        X = self.vectorizer.fit_transform(processed_texts)
        
        # 라벨 인코딩
        from sklearn.preprocessing import LabelEncoder
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(labels)
        
        # 모델 훈련
        self.classifier.fit(X, y)
        
        # 모델 저장
        joblib.dump(self.classifier, self.model_path)
        joblib.dump(self.vectorizer, self.vectorizer_path)
        joblib.dump(label_encoder, 'models/allergy_risk_label_encoder.pkl')
        
        print(f"모델이 {self.model_path}에 저장되었습니다.")
        print(f"총 {len(training_data)}개의 훈련 데이터로 훈련 완료")
        return True
    
    def load_model(self):
        """저장된 모델 로드"""
        try:
            self.classifier = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
            self.label_encoder = joblib.load('models/allergy_risk_label_encoder.pkl')
            return True
        except FileNotFoundError:
            print("저장된 모델을 찾을 수 없습니다. 모델을 훈련해주세요.")
            return False
    
    def predict_risk(self, ingredients: List[str], user_allergies: List[str]) -> Optional[Dict]:
        """알레르기 위험도 예측"""
        if not hasattr(self, 'classifier') or not hasattr(self, 'vectorizer'):
            if not self.load_model():
                return None
        
        # 성분 텍스트 생성
        ingredient_text = ' '.join(ingredients)
        processed_text = self.preprocess_text(ingredient_text)
        
        # TF-IDF 벡터화
        X = self.vectorizer.transform([processed_text])
        
        # 예측
        prediction = self.classifier.predict(X)[0]
        confidence = self.classifier.predict_proba(X).max()
        
        # 위험도 조정 (사용자 알레르기 고려)
        final_risk = self._adjust_risk_based_on_user_allergies(
            self.label_encoder.inverse_transform([prediction])[0],
            ingredients,
            user_allergies
        )
        
        return {
            'final_risk': final_risk,
            'confidence': confidence,
            'ingredients': ingredients,
            'user_allergies': user_allergies,
            'base_prediction': self.label_encoder.inverse_transform([prediction])[0]
        }
    
    def _adjust_risk_based_on_user_allergies(self, base_risk: str, ingredients: List[str], user_allergies: List[str]) -> str:
        """사용자 알레르기를 고려한 위험도 조정"""
        # 사용자 알레르기와 성분 매칭 확인
        matching_allergies = []
        for allergy in user_allergies:
            if any(allergy in ingredient for ingredient in ingredients):
                matching_allergies.append(allergy)
        
        if matching_allergies:
            # 위험한 알레르기 성분이 발견된 경우
            if base_risk == 'safe':
                return 'low_risk'
            elif base_risk == 'low_risk':
                return 'high_risk'
            else:
                return 'dangerous'
        else:
            # 사용자 알레르기 성분이 없는 경우
            if base_risk == 'dangerous':
                return 'high_risk'
            elif base_risk == 'high_risk':
                return 'low_risk'
            else:
                return 'safe'

# 사용 예시
if __name__ == "__main__":
    predictor = AllergyRiskPredictor()
    
    # 모델 훈련
    predictor.train()
    
    # 예측 테스트
    test_cases = [
        {
            "ingredients": ["에스프레소", "우유", "초콜릿 시럽"],
            "user_allergies": ["우유", "초콜릿"]
        },
        {
            "ingredients": ["에스프레소", "물"],
            "user_allergies": ["우유"]
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        result = predictor.predict_risk(
            test_case["ingredients"], 
            test_case["user_allergies"]
        )
        if result:
            print(f"테스트 {i}: {result['final_risk']} (신뢰도: {result['confidence']:.3f})")
        else:
            print(f"테스트 {i}: 예측 실패") 
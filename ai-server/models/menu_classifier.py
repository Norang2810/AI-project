import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import json
import re
from typing import Dict, List, Optional

class MenuClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 3),
            min_df=1,
            stop_words=None
        )
        self.classifier = MultinomialNB()
        self.categories = []
        self.model_path = 'models/menu_classifier.pkl'
        self.vectorizer_path = 'models/menu_classifier_vectorizer.pkl'
        
    def preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        # 한글, 영어, 숫자만 남기고 제거
        text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
        # 공백 정리
        text = re.sub(r'\s+', ' ', text).strip()
        return text.lower()
    
    def load_training_data(self):
        """훈련 데이터 로드"""
        with open('data/datasets/cafe_menu_dataset.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        menu_texts = []
        menu_categories = []
        
        for menu in data['cafe_beverages']:
            # 메뉴명과 변형명들을 모두 포함
            menu_texts.append(menu['name'])
            menu_categories.append(menu['category'])
            
            # 변형명들도 추가
            for variation in menu.get('variations', []):
                if variation != menu['name']:  # 중복 제거
                    menu_texts.append(variation)
                    menu_categories.append(menu['category'])
        
        return menu_texts, menu_categories
    
    def train(self):
        """모델 훈련"""
        print("메뉴 분류 모델 훈련 시작...")
        
        # 데이터 로드
        menu_texts, menu_categories = self.load_training_data()
        
        if len(menu_texts) < 10:
            print("훈련 데이터가 부족합니다.")
            return False
        
        # 텍스트 전처리
        processed_texts = [self.preprocess_text(text) for text in menu_texts]
        
        # TF-IDF 벡터화
        X = self.vectorizer.fit_transform(processed_texts)
        
        # 카테고리 인코딩
        from sklearn.preprocessing import LabelEncoder
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(menu_categories)
        self.categories = label_encoder.classes_
        
        # 모델 훈련
        self.classifier.fit(X, y)
        
        # 모델 저장
        joblib.dump(self.classifier, self.model_path)
        joblib.dump(self.vectorizer, self.vectorizer_path)
        joblib.dump(label_encoder, 'models/menu_classifier_label_encoder.pkl')
        
        print(f"모델이 {self.model_path}에 저장되었습니다.")
        print(f"총 {len(menu_texts)}개의 메뉴 텍스트로 훈련 완료")
        return True
    
    def load_model(self):
        """저장된 모델 로드"""
        try:
            self.classifier = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
            label_encoder = joblib.load('models/menu_classifier_label_encoder.pkl')
            self.categories = label_encoder.classes_
            return True
        except FileNotFoundError:
            print("저장된 모델을 찾을 수 없습니다. 모델을 훈련해주세요.")
            return False
    
    def predict(self, menu_text: str) -> Optional[Dict]:
        """메뉴 분류 예측"""
        if not hasattr(self, 'classifier') or not hasattr(self, 'vectorizer'):
            if not self.load_model():
                return None
        
        # 텍스트 전처리
        processed_text = self.preprocess_text(menu_text)
        
        # TF-IDF 벡터화
        X = self.vectorizer.transform([processed_text])
        
        # 예측
        prediction = self.classifier.predict(X)[0]
        confidence = self.classifier.predict_proba(X).max()
        
        return {
            'category': self.categories[prediction],
            'confidence': confidence,
            'input_text': menu_text
        }

# 사용 예시
if __name__ == "__main__":
    classifier = MenuClassifier()
    
    # 모델 훈련
    classifier.train()
    
    # 예측 테스트
    test_menus = ["아메리카노", "카페라떼", "녹차라떼", "딸기스무디"]
    for menu in test_menus:
        result = classifier.predict(menu)
        if result:
            print(f"{menu} → {result['category']} (신뢰도: {result['confidence']:.3f})")
        else:
            print(f"{menu} → 예측 실패") 
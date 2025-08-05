import json
import logging
from typing import List, Dict, Optional
from pathlib import Path

# AI 모델들 import
from .menu_classifier import MenuClassifier
from .allergy_risk_predictor import AllergyRiskPredictor
from .menu_similarity import MenuSimilarityModel
from .ingredient_matcher import IngredientMatcher

class AIAnalysisEngine:
    def __init__(self):
        self.menu_classifier = MenuClassifier()
        self.allergy_predictor = AllergyRiskPredictor()
        self.similarity_model = MenuSimilarityModel()
        self.ingredient_matcher = IngredientMatcher()
        
        # 로깅 설정
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # 모델 로드 상태
        self.models_loaded = False
        
    def load_all_models(self):
        """모든 AI 모델 로드"""
        try:
            self.logger.info("AI 모델들을 로드하는 중...")
            
            # 각 모델 로드
            menu_loaded = self.menu_classifier.load_model()
            allergy_loaded = self.allergy_predictor.load_model()
            similarity_loaded = self.similarity_model.load_model()
            ingredient_loaded = self.ingredient_matcher.load_ingredient_data()
            
            if all([menu_loaded, allergy_loaded, similarity_loaded, ingredient_loaded]):
                self.models_loaded = True
                self.logger.info("모든 AI 모델 로드 완료!")
                return True
            else:
                self.logger.warning("일부 모델 로드 실패")
                return False
                
        except Exception as e:
            self.logger.error(f"모델 로드 중 오류: {e}")
            return False
    
    def analyze_menu_text(self, menu_text: str, user_allergies: List[str] = None) -> Dict:
        """메뉴 텍스트 종합 분석"""
        try:
            self.logger.info(f"메뉴 텍스트 분석 시작: {menu_text[:50]}...")
            
            if not self.models_loaded:
                self.logger.warning("모델이 로드되지 않았습니다. 모델을 다시 로드합니다.")
                if not self.load_all_models():
                    return {"error": "AI 모델 로드 실패"}
            
            results = {
                "input_text": menu_text,
                "analysis_timestamp": None,
                "menu_classification": None,
                "allergy_risk": None,
                "similar_menus": None,
                "ingredient_analysis": None,
                "recommendations": None
            }
            
            # 1. 메뉴 분류
            self.logger.info("메뉴 분류 시작...")
            try:
                classification = self.menu_classifier.predict(menu_text)
                results["menu_classification"] = classification
                self.logger.info(f"메뉴 분류 완료: {classification}")
            except Exception as e:
                self.logger.error(f"메뉴 분류 오류: {e}")
                results["menu_classification"] = {"error": str(e)}
            
            # 2. 유사한 메뉴 찾기
            self.logger.info("유사 메뉴 검색 시작...")
            try:
                similar_menus = self.similarity_model.find_similar_menus(menu_text, top_k=5)
                results["similar_menus"] = similar_menus
                self.logger.info(f"유사 메뉴 검색 완료: {len(similar_menus)}개 발견")
            except Exception as e:
                self.logger.error(f"유사 메뉴 검색 오류: {e}")
                results["similar_menus"] = []
            
            # 3. 성분 추출 및 분석
            self.logger.info("성분 추출 시작...")
            try:
                extracted_ingredients = self.ingredient_matcher.extract_ingredients_from_text(menu_text)
                results["ingredient_analysis"] = {
                    "extracted_ingredients": extracted_ingredients,
                    "ingredient_count": len(extracted_ingredients)
                }
                self.logger.info(f"성분 추출 완료: {len(extracted_ingredients)}개 성분")
            except Exception as e:
                self.logger.error(f"성분 추출 오류: {e}")
                results["ingredient_analysis"] = {
                    "extracted_ingredients": [],
                    "ingredient_count": 0,
                    "error": str(e)
                }
            
            # 4. 알레르기 위험도 분석
            if user_allergies and extracted_ingredients:
                self.logger.info("알레르기 위험도 분석 시작...")
                try:
                    allergy_risk = self.allergy_predictor.predict_risk(extracted_ingredients, user_allergies)
                    ingredient_risk = self.ingredient_matcher.check_allergy_risk(extracted_ingredients, user_allergies)
                    
                    results["allergy_risk"] = {
                        "ml_prediction": allergy_risk,
                        "rule_based_analysis": ingredient_risk,
                        "final_risk_level": self._determine_final_risk(allergy_risk, ingredient_risk)
                    }
                    self.logger.info(f"알레르기 위험도 분석 완료: {results['allergy_risk']['final_risk_level']}")
                except Exception as e:
                    self.logger.error(f"알레르기 위험도 분석 오류: {e}")
                    results["allergy_risk"] = {
                        "error": str(e),
                        "final_risk_level": "unknown"
                    }
            
            # 5. 추천 시스템
            if user_allergies:
                recommendations = self._generate_recommendations(menu_text, user_allergies, extracted_ingredients)
                results["recommendations"] = recommendations
            
            return results
            
        except Exception as e:
            self.logger.error(f"메뉴 분석 중 오류: {e}")
            return {"error": f"분석 실패: {str(e)}"}
    
    def _determine_final_risk(self, ml_risk: Dict, rule_risk: Dict) -> str:
        """ML 예측과 규칙 기반 분석을 결합한 최종 위험도 결정"""
        if not ml_risk or not rule_risk:
            return "unknown"
        
        # ML 예측과 규칙 기반 결과 결합
        ml_level = ml_risk.get('final_risk', 'unknown')
        rule_level = rule_risk.get('risk_level', 'unknown')
        
        # 위험도 매핑
        risk_mapping = {
            'safe': 0,
            'low_risk': 1,
            'high_risk': 2,
            'dangerous': 3
        }
        
        ml_score = risk_mapping.get(ml_level, 1)
        rule_score = risk_mapping.get(rule_level, 1)
        
        # 더 높은 위험도 선택 (보수적 접근)
        final_score = max(ml_score, rule_score)
        
        # 점수를 위험도로 변환
        for risk_level, score in risk_mapping.items():
            if score == final_score:
                return risk_level
        
        return "unknown"
    
    def _generate_recommendations(self, menu_text: str, user_allergies: List[str], extracted_ingredients: List[str]) -> Dict:
        """개인화된 추천 생성"""
        recommendations = {
            "safe_alternatives": [],
            "warning_messages": [],
            "safety_tips": []
        }
        
        # 1. 안전한 대안 메뉴 찾기
        safe_menus = self.similarity_model.find_safe_menus(user_allergies, top_k=5)
        recommendations["safe_alternatives"] = safe_menus
        
        # 2. 경고 메시지 생성
        if extracted_ingredients:
            risky_ingredients = []
            for ingredient in extracted_ingredients:
                if any(allergy in ingredient for allergy in user_allergies):
                    risky_ingredients.append(ingredient)
            
            if risky_ingredients:
                recommendations["warning_messages"].append({
                    "type": "allergy_warning",
                    "message": f"다음 성분이 포함되어 있습니다: {', '.join(risky_ingredients)}",
                    "severity": "high"
                })
        
        # 3. 안전 팁 생성
        if user_allergies:
            tips = []
            for allergy in user_allergies:
                if allergy == "우유":
                    tips.append("우유 대신 아몬드 밀크나 오트 밀크를 요청하세요.")
                elif allergy == "글루텐":
                    tips.append("글루텐 프리 옵션이 있는지 확인하세요.")
                elif allergy == "견과류":
                    tips.append("견과류가 포함되지 않은 메뉴를 선택하세요.")
            
            recommendations["safety_tips"] = tips
        
        return recommendations
    
    def batch_analyze_menus(self, menu_texts: List[str], user_allergies: List[str] = None) -> List[Dict]:
        """여러 메뉴 일괄 분석"""
        results = []
        
        for i, menu_text in enumerate(menu_texts):
            self.logger.info(f"메뉴 {i+1}/{len(menu_texts)} 분석 중...")
            result = self.analyze_menu_text(menu_text, user_allergies)
            result["menu_index"] = i
            results.append(result)
        
        return results
    
    def get_model_status(self) -> Dict:
        """모델 상태 확인"""
        return {
            "models_loaded": self.models_loaded,
            "menu_classifier": hasattr(self.menu_classifier, 'classifier'),
            "allergy_predictor": hasattr(self.allergy_predictor, 'classifier'),
            "similarity_model": hasattr(self.similarity_model, 'vectorizer'),
            "ingredient_matcher": hasattr(self.ingredient_matcher, 'ingredient_synonyms')
        }
    
    def retrain_models(self) -> Dict:
        """모든 모델 재훈련"""
        results = {}
        
        try:
            # 각 모델 훈련
            results["menu_classifier"] = self.menu_classifier.train()
            results["allergy_predictor"] = self.allergy_predictor.train()
            results["similarity_model"] = self.similarity_model.train()
            
            # 모델 다시 로드
            self.load_all_models()
            
            return results
            
        except Exception as e:
            self.logger.error(f"모델 재훈련 중 오류: {e}")
            return {"error": str(e)}

# 사용 예시
if __name__ == "__main__":
    engine = AIAnalysisEngine()
    
    # 모델 로드
    if engine.load_all_models():
        print("✅ AI 분석 엔진 초기화 완료")
        
        # 메뉴 분석 테스트
        test_menu = "카페라떼"
        user_allergies = ["우유"]
        
        result = engine.analyze_menu_text(test_menu, user_allergies)
        print(f"\n분석 결과: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        # 모델 상태 확인
        status = engine.get_model_status()
        print(f"\n모델 상태: {status}")
    else:
        print("❌ AI 분석 엔진 초기화 실패") 
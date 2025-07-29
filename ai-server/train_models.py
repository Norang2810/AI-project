#!/usr/bin/env python3
"""
AI 모델 훈련 스크립트
모든 AI 모델을 훈련하고 저장합니다.
"""

import os
import sys
import logging
from pathlib import Path

# AI 모델들 import
from models.menu_classifier import MenuClassifier
from models.allergy_risk_predictor import AllergyRiskPredictor
from models.menu_similarity import MenuSimilarityModel
from models.ingredient_matcher import IngredientMatcher

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_models_directory():
    """models 디렉토리 생성"""
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    logger.info(f"✅ models 디렉토리 확인/생성 완료: {models_dir}")

def check_data_availability():
    """데이터셋 가용성 확인"""
    dataset_path = Path("../data/datasets/cafe_menu_dataset.json")
    
    if not dataset_path.exists():
        logger.error(f"❌ 데이터셋을 찾을 수 없습니다: {dataset_path}")
        return False
    
    logger.info(f"✅ 데이터셋 확인 완료: {dataset_path}")
    return True

def train_menu_classifier():
    """메뉴 분류 모델 훈련"""
    logger.info("🔄 메뉴 분류 모델 훈련 시작...")
    
    try:
        classifier = MenuClassifier()
        success = classifier.train()
        
        if success:
            logger.info("✅ 메뉴 분류 모델 훈련 완료")
            return True
        else:
            logger.error("❌ 메뉴 분류 모델 훈련 실패")
            return False
            
    except Exception as e:
        logger.error(f"❌ 메뉴 분류 모델 훈련 중 오류: {e}")
        return False

def train_allergy_risk_predictor():
    """알레르기 위험도 예측 모델 훈련"""
    logger.info("🔄 알레르기 위험도 예측 모델 훈련 시작...")
    
    try:
        predictor = AllergyRiskPredictor()
        success = predictor.train()
        
        if success:
            logger.info("✅ 알레르기 위험도 예측 모델 훈련 완료")
            return True
        else:
            logger.error("❌ 알레르기 위험도 예측 모델 훈련 실패")
            return False
            
    except Exception as e:
        logger.error(f"❌ 알레르기 위험도 예측 모델 훈련 중 오류: {e}")
        return False

def train_menu_similarity_model():
    """메뉴 유사도 모델 훈련"""
    logger.info("🔄 메뉴 유사도 모델 훈련 시작...")
    
    try:
        similarity_model = MenuSimilarityModel()
        success = similarity_model.train()
        
        if success:
            logger.info("✅ 메뉴 유사도 모델 훈련 완료")
            return True
        else:
            logger.error("❌ 메뉴 유사도 모델 훈련 실패")
            return False
            
    except Exception as e:
        logger.error(f"❌ 메뉴 유사도 모델 훈련 중 오류: {e}")
        return False

def initialize_ingredient_matcher():
    """성분 매칭 모델 초기화"""
    logger.info("🔄 성분 매칭 모델 초기화...")
    
    try:
        matcher = IngredientMatcher()
        matcher.load_ingredient_data()
        
        logger.info("✅ 성분 매칭 모델 초기화 완료")
        return True
        
    except Exception as e:
        logger.error(f"❌ 성분 매칭 모델 초기화 중 오류: {e}")
        return False

def test_models():
    """훈련된 모델들 테스트"""
    logger.info("🧪 모델 테스트 시작...")
    
    test_results = {}
    
    try:
        # 1. 메뉴 분류 모델 테스트
        classifier = MenuClassifier()
        if classifier.load_model():
            test_menu = "카페라떼"
            prediction = classifier.predict(test_menu)
            test_results["menu_classifier"] = {
                "status": "success",
                "test_input": test_menu,
                "prediction": prediction
            }
            logger.info(f"✅ 메뉴 분류 테스트 완료: {test_menu} -> {prediction}")
        else:
            test_results["menu_classifier"] = {"status": "failed"}
            logger.error("❌ 메뉴 분류 모델 테스트 실패")
        
        # 2. 알레르기 위험도 예측 모델 테스트
        predictor = AllergyRiskPredictor()
        if predictor.load_model():
            test_ingredients = ["우유", "초콜릿"]
            test_allergies = ["우유"]
            prediction = predictor.predict_risk(test_ingredients, test_allergies)
            test_results["allergy_predictor"] = {
                "status": "success",
                "test_input": {"ingredients": test_ingredients, "allergies": test_allergies},
                "prediction": prediction
            }
            logger.info(f"✅ 알레르기 위험도 예측 테스트 완료")
        else:
            test_results["allergy_predictor"] = {"status": "failed"}
            logger.error("❌ 알레르기 위험도 예측 모델 테스트 실패")
        
        # 3. 메뉴 유사도 모델 테스트
        similarity_model = MenuSimilarityModel()
        if similarity_model.load_model():
            test_query = "라떼"
            similar_menus = similarity_model.find_similar_menus(test_query, top_k=3)
            test_results["menu_similarity"] = {
                "status": "success",
                "test_input": test_query,
                "similar_menus_count": len(similar_menus)
            }
            logger.info(f"✅ 메뉴 유사도 테스트 완료: {len(similar_menus)}개 유사 메뉴 발견")
        else:
            test_results["menu_similarity"] = {"status": "failed"}
            logger.error("❌ 메뉴 유사도 모델 테스트 실패")
        
        # 4. 성분 매칭 모델 테스트
        matcher = IngredientMatcher()
        matcher.load_ingredient_data()
        test_ingredients = ["우유", "초콜릿"]
        test_allergies = ["우유"]
        risk_analysis = matcher.check_allergy_risk(test_ingredients, test_allergies)
        test_results["ingredient_matcher"] = {
            "status": "success",
            "test_input": {"ingredients": test_ingredients, "allergies": test_allergies},
            "risk_level": risk_analysis.get("risk_level")
        }
        logger.info(f"✅ 성분 매칭 테스트 완료: 위험도 {risk_analysis.get('risk_level')}")
        
        return test_results
        
    except Exception as e:
        logger.error(f"❌ 모델 테스트 중 오류: {e}")
        return {"error": str(e)}

def main():
    """메인 훈련 프로세스"""
    logger.info("🚀 AI 모델 훈련 프로세스 시작")
    
    # 1. 디렉토리 및 데이터 확인
    create_models_directory()
    
    if not check_data_availability():
        logger.error("❌ 데이터셋이 없어 훈련을 중단합니다.")
        return False
    
    # 2. 각 모델 훈련
    training_results = {}
    
    # 메뉴 분류 모델
    training_results["menu_classifier"] = train_menu_classifier()
    
    # 알레르기 위험도 예측 모델
    training_results["allergy_risk_predictor"] = train_allergy_risk_predictor()
    
    # 메뉴 유사도 모델
    training_results["menu_similarity"] = train_menu_similarity_model()
    
    # 성분 매칭 모델 (규칙 기반이므로 훈련 불필요)
    training_results["ingredient_matcher"] = initialize_ingredient_matcher()
    
    # 3. 훈련 결과 요약
    successful_models = sum(training_results.values())
    total_models = len(training_results)
    
    logger.info(f"\n📊 훈련 결과 요약:")
    logger.info(f"   총 모델 수: {total_models}")
    logger.info(f"   성공: {successful_models}")
    logger.info(f"   실패: {total_models - successful_models}")
    logger.info(f"   성공률: {(successful_models/total_models)*100:.1f}%")
    
    # 4. 모델 테스트
    logger.info("\n🧪 훈련된 모델 테스트 중...")
    test_results = test_models()
    
    # 5. 최종 결과 출력
    logger.info(f"\n🎉 AI 모델 훈련 프로세스 완료!")
    
    if successful_models == total_models:
        logger.info("✅ 모든 모델이 성공적으로 훈련되었습니다!")
        return True
    else:
        logger.warning("⚠️ 일부 모델 훈련에 실패했습니다.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 
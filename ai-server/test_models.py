#!/usr/bin/env python3
"""
AI 모델 테스트 스크립트
훈련된 모든 AI 모델을 테스트합니다.
"""

import json
import logging
from typing import Dict, List

# AI 모델들 import
from models.menu_classifier import MenuClassifier
from models.allergy_risk_predictor import AllergyRiskPredictor
from models.menu_similarity import MenuSimilarityModel
from models.ingredient_matcher import IngredientMatcher
from models.ai_analysis_engine import AIAnalysisEngine

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_menu_classifier():
    """메뉴 분류 모델 테스트"""
    logger.info("🧪 메뉴 분류 모델 테스트 시작...")
    
    try:
        classifier = MenuClassifier()
        if not classifier.load_model():
            logger.error("❌ 메뉴 분류 모델 로드 실패")
            return False
        
        test_menus = [
            "아메리카노",
            "카페라떼", 
            "녹차라떼",
            "딸기스무디",
            "아이스티",
            "에스프레소",
            "카푸치노",
            "모카",
            "바닐라라떼",
            "카라멜마끼아또"
        ]
        
        results = []
        for menu in test_menus:
            prediction = classifier.predict(menu)
            if prediction:
                results.append({
                    "input": menu,
                    "prediction": prediction
                })
                logger.info(f"  {menu} → {prediction['category']} (신뢰도: {prediction['confidence']:.3f})")
            else:
                logger.warning(f"  {menu} → 예측 실패")
        
        success_rate = len(results) / len(test_menus) * 100
        logger.info(f"✅ 메뉴 분류 테스트 완료: 성공률 {success_rate:.1f}%")
        
        return success_rate > 80  # 80% 이상 성공 시 통과
        
    except Exception as e:
        logger.error(f"❌ 메뉴 분류 모델 테스트 중 오류: {e}")
        return False

def test_allergy_risk_predictor():
    """알레르기 위험도 예측 모델 테스트"""
    logger.info("🧪 알레르기 위험도 예측 모델 테스트 시작...")
    
    try:
        predictor = AllergyRiskPredictor()
        if not predictor.load_model():
            logger.error("❌ 알레르기 위험도 예측 모델 로드 실패")
            return False
        
        test_cases = [
            {
                "ingredients": ["에스프레소", "우유", "초콜릿 시럽"],
                "user_allergies": ["우유", "초콜릿"],
                "expected_risk": "high_risk"
            },
            {
                "ingredients": ["에스프레소", "물"],
                "user_allergies": ["우유"],
                "expected_risk": "safe"
            },
            {
                "ingredients": ["우유", "크림", "버터"],
                "user_allergies": ["우유"],
                "expected_risk": "dangerous"
            },
            {
                "ingredients": ["녹차", "꿀"],
                "user_allergies": ["견과류"],
                "expected_risk": "safe"
            }
        ]
        
        results = []
        for i, test_case in enumerate(test_cases, 1):
            prediction = predictor.predict_risk(
                test_case["ingredients"], 
                test_case["user_allergies"]
            )
            
            if prediction:
                results.append({
                    "test_case": i,
                    "input": test_case,
                    "prediction": prediction,
                    "expected": test_case["expected_risk"]
                })
                logger.info(f"  테스트 {i}: {prediction['final_risk']} (신뢰도: {prediction['confidence']:.3f})")
            else:
                logger.warning(f"  테스트 {i}: 예측 실패")
        
        success_rate = len(results) / len(test_cases) * 100
        logger.info(f"✅ 알레르기 위험도 예측 테스트 완료: 성공률 {success_rate:.1f}%")
        
        return success_rate > 80
        
    except Exception as e:
        logger.error(f"❌ 알레르기 위험도 예측 모델 테스트 중 오류: {e}")
        return False

def test_menu_similarity():
    """메뉴 유사도 모델 테스트"""
    logger.info("🧪 메뉴 유사도 모델 테스트 시작...")
    
    try:
        similarity_model = MenuSimilarityModel()
        if not similarity_model.load_model():
            logger.error("❌ 메뉴 유사도 모델 로드 실패")
            return False
        
        test_queries = [
            "라떼",
            "아메리카노",
            "스무디",
            "티",
            "에스프레소"
        ]
        
        results = []
        for query in test_queries:
            similar_menus = similarity_model.find_similar_menus(query, top_k=3)
            results.append({
                "query": query,
                "similar_menus": similar_menus
            })
            logger.info(f"  '{query}' → {len(similar_menus)}개 유사 메뉴 발견")
        
        success_rate = len([r for r in results if r["similar_menus"]]) / len(results) * 100
        logger.info(f"✅ 메뉴 유사도 테스트 완료: 성공률 {success_rate:.1f}%")
        
        return success_rate > 80
        
    except Exception as e:
        logger.error(f"❌ 메뉴 유사도 모델 테스트 중 오류: {e}")
        return False

def test_ingredient_matcher():
    """성분 매칭 모델 테스트"""
    logger.info("🧪 성분 매칭 모델 테스트 시작...")
    
    try:
        matcher = IngredientMatcher()
        matcher.load_ingredient_data()
        
        test_cases = [
            {
                "ingredients": ["우유", "초콜릿"],
                "user_allergies": ["우유"],
                "expected_risk": "high_risk"
            },
            {
                "ingredients": ["에스프레소", "물"],
                "user_allergies": ["우유"],
                "expected_risk": "safe"
            },
            {
                "ingredients": ["헤이즐넛", "아몬드"],
                "user_allergies": ["견과류"],
                "expected_risk": "dangerous"
            }
        ]
        
        results = []
        for i, test_case in enumerate(test_cases, 1):
            risk_analysis = matcher.check_allergy_risk(
                test_case["ingredients"], 
                test_case["user_allergies"]
            )
            
            results.append({
                "test_case": i,
                "input": test_case,
                "analysis": risk_analysis,
                "expected": test_case["expected_risk"]
            })
            logger.info(f"  테스트 {i}: 위험도 {risk_analysis['risk_level']}")
        
        # 성분 자동완성 테스트
        suggestions = matcher.get_ingredient_suggestions("우", top_k=3)
        logger.info(f"  성분 자동완성 '우' → {suggestions}")
        
        success_rate = len(results) / len(test_cases) * 100
        logger.info(f"✅ 성분 매칭 테스트 완료: 성공률 {success_rate:.1f}%")
        
        return success_rate > 80
        
    except Exception as e:
        logger.error(f"❌ 성분 매칭 모델 테스트 중 오류: {e}")
        return False

def test_ai_analysis_engine():
    """AI 분석 엔진 통합 테스트"""
    logger.info("🧪 AI 분석 엔진 통합 테스트 시작...")
    
    try:
        engine = AIAnalysisEngine()
        if not engine.load_all_models():
            logger.error("❌ AI 분석 엔진 모델 로드 실패")
            return False
        
        test_cases = [
            {
                "menu_text": "카페라떼",
                "user_allergies": ["우유"],
                "expected_risk": "high_risk"
            },
            {
                "menu_text": "아메리카노",
                "user_allergies": ["우유"],
                "expected_risk": "safe"
            },
            {
                "menu_text": "초콜릿 라떼",
                "user_allergies": ["우유", "초콜릿"],
                "expected_risk": "dangerous"
            }
        ]
        
        results = []
        for i, test_case in enumerate(test_cases, 1):
            analysis = engine.analyze_menu_text(
                test_case["menu_text"], 
                test_case["user_allergies"]
            )
            
            if "error" not in analysis:
                results.append({
                    "test_case": i,
                    "input": test_case,
                    "analysis": analysis
                })
                logger.info(f"  테스트 {i}: {analysis.get('allergy_risk', {}).get('final_risk_level', 'unknown')}")
            else:
                logger.warning(f"  테스트 {i}: 분석 실패")
        
        success_rate = len(results) / len(test_cases) * 100
        logger.info(f"✅ AI 분석 엔진 테스트 완료: 성공률 {success_rate:.1f}%")
        
        return success_rate > 80
        
    except Exception as e:
        logger.error(f"❌ AI 분석 엔진 테스트 중 오류: {e}")
        return False

def main():
    """메인 테스트 프로세스"""
    logger.info("🚀 AI 모델 테스트 프로세스 시작")
    
    test_results = {}
    
    # 각 모델 테스트
    test_results["menu_classifier"] = test_menu_classifier()
    test_results["allergy_risk_predictor"] = test_allergy_risk_predictor()
    test_results["menu_similarity"] = test_menu_similarity()
    test_results["ingredient_matcher"] = test_ingredient_matcher()
    test_results["ai_analysis_engine"] = test_ai_analysis_engine()
    
    # 결과 요약
    successful_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    logger.info(f"\n📊 테스트 결과 요약:")
    logger.info(f"   총 테스트: {total_tests}")
    logger.info(f"   성공: {successful_tests}")
    logger.info(f"   실패: {total_tests - successful_tests}")
    logger.info(f"   성공률: {(successful_tests/total_tests)*100:.1f}%")
    
    # 상세 결과 출력
    for test_name, result in test_results.items():
        status = "✅ 통과" if result else "❌ 실패"
        logger.info(f"   {test_name}: {status}")
    
    if successful_tests == total_tests:
        logger.info("\n🎉 모든 AI 모델 테스트가 성공했습니다!")
        return True
    else:
        logger.warning("\n⚠️ 일부 AI 모델 테스트에 실패했습니다.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 
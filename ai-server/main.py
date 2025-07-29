from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Body, Form
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import cv2
import numpy as np
import json
import os
from typing import List, Dict, Optional
import logging
from datetime import datetime

# AI 모델들 import
from models.ai_analysis_engine import AIAnalysisEngine
from models.menu_classifier import MenuClassifier
from models.allergy_risk_predictor import AllergyRiskPredictor
from models.menu_similarity import MenuSimilarityModel
from models.ingredient_matcher import IngredientMatcher

# FastAPI 앱 초기화
app = FastAPI(title="알레르기 안전 메뉴 분석 AI 서버", version="2.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AI 분석 엔진 초기화
ai_engine = AIAnalysisEngine()

# EasyOCR 초기화
try:
    reader = easyocr.Reader(['ko', 'en'], gpu=False, model_storage_directory='./models', download_enabled=True)
    logger.info("✅ EasyOCR 초기화 완료")
except Exception as e:
    logger.error(f"❌ EasyOCR 초기화 실패: {e}")
    reader = None

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 AI 모델들 로드"""
    logger.info("AI 서버 시작 중...")
    
    # AI 모델들 로드
    if ai_engine.load_all_models():
        logger.info("✅ 모든 AI 모델 로드 완료")
    else:
        logger.warning("⚠️ 일부 AI 모델 로드 실패")

@app.get("/")
async def root():
    """서버 상태 확인"""
    return {
        "message": "알레르기 안전 메뉴 분석 AI 서버",
        "version": "2.0.0",
        "status": "running",
        "models_loaded": ai_engine.models_loaded
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    model_status = ai_engine.get_model_status()
    return {
        "status": "healthy",
        "models_loaded": ai_engine.models_loaded,
        "model_status": model_status,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze-menu")
async def analyze_menu(
    menu_text: str = Body(...),
    user_allergies: Optional[List[str]] = Body(None)
):
    """메뉴 텍스트 분석"""
    try:
        logger.info(f"메뉴 분석 요청: {menu_text}")
        
        # AI 분석 엔진으로 종합 분석
        result = ai_engine.analyze_menu_text(menu_text, user_allergies)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "success": True,
            "analysis": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"메뉴 분석 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image")
async def analyze_menu_image(
    file: UploadFile = File(...),
    user_allergies: Optional[str] = Form(default=None)
):
    """메뉴 이미지 분석"""
    try:
        logger.info(f"이미지 분석 요청: {file.filename}")
        logger.info(f"파일 크기: {file.size} bytes")
        logger.info(f"파일 타입: {file.content_type}")
        logger.info(f"사용자 알레르기: {user_allergies}")
        
        # 파일 존재 여부 확인
        if not file or not file.filename:
            logger.error("파일이 없거나 파일명이 없습니다")
            raise HTTPException(status_code=400, detail="파일이 필요합니다")
        
        # 알레르기 정보 파싱
        allergies_list = []
        if user_allergies:
            try:
                allergies_list = user_allergies.split(',')
                allergies_list = [allergy.strip() for allergy in allergies_list]
            except:
                logger.warning(f"알레르기 정보 파싱 실패: {user_allergies}")
        
        # 이미지 저장 (파일명 인코딩 문제 해결)
        import uuid
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.png'
        safe_filename = f"temp_{uuid.uuid4().hex}{file_extension}"
        image_path = safe_filename
        
        content = await file.read()
        logger.info(f"읽은 파일 크기: {len(content)} bytes")
        logger.info(f"안전한 파일명: {safe_filename}")
        
        with open(image_path, "wb") as buffer:
            buffer.write(content)
        
        # 이미지 파일 존재 확인
        if not os.path.exists(image_path):
            raise HTTPException(status_code=400, detail="이미지 파일 저장 실패")
        
        logger.info(f"이미지 파일 저장됨: {image_path}")
        
        # OCR로 텍스트 추출
        if reader is None:
            raise HTTPException(status_code=500, detail="OCR 엔진이 초기화되지 않았습니다")
        
        try:
            # 이미지 읽기 (인코딩 문제 해결)
            image = cv2.imdecode(np.frombuffer(content, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise Exception("이미지를 읽을 수 없습니다")
            
            # 한글 인식을 위한 OCR 설정
            results = reader.readtext(
                image,
                detail=0,  # 텍스트만 반환
                paragraph=True,  # 문단 단위로 그룹화
                contrast_ths=0.1,  # 대비 임계값 낮춤
                adjust_contrast=0.5,  # 대비 조정
                text_threshold=0.6,  # 텍스트 임계값
                link_threshold=0.4,  # 링크 임계값
                low_text=0.4,  # 낮은 텍스트 임계값
                canvas_size=2560,  # 캔버스 크기
                mag_ratio=1.5  # 확대 비율
            )
            
            if isinstance(results, list):
                extracted_text = " ".join(results)
            else:
                extracted_text = " ".join([text[1] for text in results])
            
            logger.info(f"OCR 결과: {len(results) if isinstance(results, list) else len(results)}개 텍스트 블록 발견")
            logger.info(f"추출된 텍스트: {extracted_text[:200]}...")
            
        except Exception as ocr_error:
            logger.error(f"OCR 오류: {ocr_error}")
            raise HTTPException(status_code=500, detail=f"OCR 처리 실패: {str(ocr_error)}")
        finally:
            # 임시 파일 삭제
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                    logger.info(f"임시 파일 삭제됨: {image_path}")
                except Exception as e:
                    logger.warning(f"임시 파일 삭제 실패: {e}")
        
        if not extracted_text.strip():
            logger.warning("OCR에서 텍스트를 추출할 수 없습니다. 기본 분석을 시도합니다.")
            # 기본 텍스트로 분석 시도
            extracted_text = "메뉴 분석"
        
        # 텍스트 정제 (개선된 버전)
        import re
        
        # 기본 정제
        extracted_text = extracted_text.replace('\n', ' ').replace('\r', ' ')
        extracted_text = ' '.join(extracted_text.split())  # 연속된 공백 제거
        
        # 노이즈 제거 (특수문자, 숫자, 의미없는 텍스트)
        # 메뉴 관련 키워드는 보존
        menu_keywords = [
            'coffee', 'latte', 'cappuccino', 'americano', 'espresso',
            'mocha', 'caramel', 'vanilla', 'chocolate', 'milk',
            'cream', 'sugar', 'syrup', 'ice', 'hot',
            '카페', '라떼', '카푸치노', '아메리카노', '에스프레소',
            '모카', '카라멜', '바닐라', '초콜릿', '우유',
            '크림', '설탕', '시럽', '아이스', '핫'
        ]
        
        # 의미있는 텍스트만 추출
        words = extracted_text.split()
        meaningful_words = []
        
        for word in words:
            # 메뉴 키워드가 포함된 단어는 보존
            if any(keyword in word.lower() for keyword in menu_keywords):
                meaningful_words.append(word)
            # 숫자나 특수문자만 있는 단어는 제거
            elif not re.match(r'^[0-9~!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>/?]+$', word):
                meaningful_words.append(word)
        
        extracted_text = ' '.join(meaningful_words)
        
        logger.info(f"정제된 텍스트: {extracted_text}")
        
        # AI 분석 엔진으로 종합 분석
        analysis_result = ai_engine.analyze_menu_text(extracted_text, allergies_list)
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "analysis": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"이미지 분석 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-analyze")
async def batch_analyze_menus(
    menu_texts: List[str] = Body(...),
    user_allergies: Optional[List[str]] = Body(None)
):
    """여러 메뉴 일괄 분석"""
    try:
        logger.info(f"일괄 분석 요청: {len(menu_texts)}개 메뉴")
        
        results = ai_engine.batch_analyze_menus(menu_texts, user_allergies)
        
        return {
            "success": True,
            "results": results,
            "total_analyzed": len(results),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"일괄 분석 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/find-similar-menus")
async def find_similar_menus(
    query: str,
    top_k: int = 5,
    user_allergies: Optional[List[str]] = None
):
    """유사한 메뉴 찾기"""
    try:
        logger.info(f"유사 메뉴 검색: {query}")
        
        if user_allergies:
            # 알레르기를 고려한 추천
            suggestions = ai_engine.similarity_model.get_menu_suggestions(query, user_allergies)
        else:
            # 일반적인 유사 메뉴 검색
            similar_menus = ai_engine.similarity_model.find_similar_menus(query, top_k)
            suggestions = {
                "query": query,
                "suggestions": similar_menus,
                "total_found": len(similar_menus)
            }
        
        return {
            "success": True,
            "suggestions": suggestions,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"유사 메뉴 검색 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/find-safe-menus")
async def find_safe_menus(
    user_allergies: List[str],
    top_k: int = 10
):
    """사용자 알레르기에 안전한 메뉴 찾기"""
    try:
        logger.info(f"안전 메뉴 검색: {user_allergies}")
        
        safe_menus = ai_engine.similarity_model.find_safe_menus(user_allergies, top_k)
        
        return {
            "success": True,
            "safe_menus": safe_menus,
            "total_safe": len(safe_menus),
            "user_allergies": user_allergies,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"안전 메뉴 검색 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check-ingredient-risk")
async def check_ingredient_risk(
    ingredients: List[str] = Body(...),
    user_allergies: List[str] = Body(...)
):
    """성분 알레르기 위험도 체크"""
    try:
        logger.info(f"성분 위험도 체크: {ingredients} vs {user_allergies}")
        
        risk_analysis = ai_engine.ingredient_matcher.check_allergy_risk(ingredients, user_allergies)
        
        return {
            "success": True,
            "risk_analysis": risk_analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"성분 위험도 체크 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-status")
async def get_model_status():
    """AI 모델 상태 확인"""
    try:
        status = ai_engine.get_model_status()
        
        return {
            "success": True,
            "model_status": status,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"모델 상태 확인 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain-models")
async def retrain_models():
    """모든 AI 모델 재훈련"""
    try:
        logger.info("모델 재훈련 시작")
        
        results = ai_engine.retrain_models()
        
        return {
            "success": True,
            "training_results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"모델 재훈련 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ingredient-suggestions")
async def get_ingredient_suggestions(
    partial_ingredient: str,
    top_k: int = 5
):
    """성분명 자동완성"""
    try:
        suggestions = ai_engine.ingredient_matcher.get_ingredient_suggestions(partial_ingredient, top_k)
        
        return {
            "success": True,
            "suggestions": suggestions,
            "query": partial_ingredient,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"성분 자동완성 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import easyocr
import cv2
import numpy as np
import json
import os
import sys
import time
import uuid
from typing import List, Dict, Optional
import logging
from datetime import datetime
import traceback
import re


# AI 모델들 import (안전한 import)
try:
    from models.ai_analysis_engine import AIAnalysisEngine
    from models.menu_classifier import MenuClassifier
    from models.allergy_risk_predictor import AllergyRiskPredictor
    from models.menu_similarity import MenuSimilarityModel
    from models.ingredient_matcher import IngredientMatcher
    MODELS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ AI 모델 import 실패: {e}")
    MODELS_AVAILABLE = False

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
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# AI 분석 엔진 초기화 (안전한 초기화)
ai_engine = None
if MODELS_AVAILABLE:
    try:
        ai_engine = AIAnalysisEngine()
        logger.info("✅ AI 분석 엔진 초기화 완료")
    except Exception as e:
        logger.error(f"❌ AI 분석 엔진 초기화 실패: {e}")
        ai_engine = None

# EasyOCR 초기화 (안전한 초기화)
reader = None
try:
    logger.info("EasyOCR 초기화 시작...")
    reader = easyocr.Reader(
        ['en'],  # 영어만 사용 (안정성 향상)
        gpu=False, 
        model_storage_directory='./models', 
        download_enabled=True,
        # 안정성 최적화 설정
        quantize=False,  # 양자화 비활성화 (안정성 향상)
        verbose=False  # 불필요한 로그 제거
    )
    logger.info("✅ EasyOCR 초기화 완료")
except Exception as e:
    logger.error(f"❌ EasyOCR 초기화 실패: {e}")
    reader = None

# 대안 OCR 함수 (Tesseract 사용)
def extract_text_with_tesseract(image):
    """Tesseract를 사용한 텍스트 추출 (대안)"""
    try:
        import pytesseract
        from PIL import Image
        import numpy as np
        
        # OpenCV 이미지를 PIL 이미지로 변환
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)
        
        # Tesseract OCR 실행
        text = pytesseract.image_to_string(pil_image, lang='eng')
        logger.info("✅ Tesseract OCR 완료")
        return text.strip()
    except Exception as e:
        logger.error(f"❌ Tesseract OCR 실패: {e}")
        return ""

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 AI 모델들 로드"""
    logger.info("🚀 AI 서버 시작 중...")
    
    # AI 모델들 로드 (안전한 로드)
    if ai_engine is not None:
        try:
            if ai_engine.load_all_models():
                logger.info("✅ 모든 AI 모델 로드 완료")
            else:
                logger.warning("⚠️ 일부 AI 모델 로드 실패")
        except Exception as e:
            logger.error(f"❌ AI 모델 로드 중 오류: {e}")
    else:
        logger.warning("⚠️ AI 엔진이 초기화되지 않았습니다")
    
    logger.info("✅ AI 서버 시작 완료")

@app.get("/")
async def root():
    """서버 상태 확인"""
    return {
        "message": "알레르기 안전 메뉴 분석 AI 서버",
        "version": "2.0.0",
        "status": "running",
        "models_loaded": ai_engine.models_loaded if ai_engine else False,
        "ocr_available": reader is not None
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    model_status = {}
    if ai_engine:
        try:
            model_status = ai_engine.get_model_status()
        except Exception as e:
            logger.error(f"모델 상태 확인 오류: {e}")
            model_status = {"error": str(e)}
    
    return {
        "status": "healthy",
        "models_loaded": ai_engine.models_loaded if ai_engine else False,
        "model_status": model_status,
        "ocr_available": reader is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze-menu")
async def analyze_menu(
    menu_text: str = Body(...),
    user_allergies: Optional[List[str]] = Body(None)
):
    """메뉴 텍스트 분석"""
    try:
        logger.info(f"📩 메뉴 분석 요청 수신됨")
        logger.info(f"📝 입력된 메뉴 텍스트: {menu_text}")
        logger.info(f"⚠️ 사용자 알레르기 정보: {user_allergies}")

        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")

        # AI 분석 엔진으로 종합 분석
        result = ai_engine.analyze_menu_text(menu_text, user_allergies)

        if "error" in result:
            logger.error(f"🚫 분석 결과에 오류 포함됨: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])

        logger.info(f"✅ 분석 결과 성공적으로 반환됨")
        return {
            "success": True,
            "analysis": result,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"❌ 메뉴 분석 중 오류 발생: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")

@app.post("/analyze-image")
async def analyze_menu_image(
    file: UploadFile = File(...),
    user_allergies: Optional[str] = Form(default=None)
):
    try:
        logger.info(f"이미지 분석 요청: {file.filename}")
        logger.info(f"파일 크기: {file.size} bytes")
        logger.info(f"파일 타입: {file.content_type}")
        logger.info(f"사용자 알레르기: {user_allergies}")
        
        if not file or not file.filename:
            logger.error("파일이 없거나 파일명이 없습니다")
            raise HTTPException(status_code=400, detail="파일이 필요합니다")

        allergies_list = []
        if user_allergies:
            try:
                allergies_list = [a.strip() for a in user_allergies.split(',')]
            except Exception:
                logger.warning(f"알레르기 정보 파싱 실패: {user_allergies}")
        
        file_extension = os.path.splitext(file.filename)[1] or ".png"
        safe_filename = f"temp_{uuid.uuid4().hex}{file_extension}"
        image_path = safe_filename

        content = await file.read()
        logger.info(f"읽은 파일 크기: {len(content)} bytes")
        logger.info(f"안전한 파일명: {safe_filename}")

        with open(image_path, "wb") as buffer:
            buffer.write(content)

        if not os.path.exists(image_path):
            raise HTTPException(status_code=400, detail="이미지 파일 저장 실패")
        
        logger.info(f"이미지 파일 저장됨: {image_path}")

        if reader is None:
            raise HTTPException(status_code=500, detail="OCR 엔진이 초기화되지 않았습니다")

        extracted_text = ""

        try:
            image = cv2.imdecode(np.frombuffer(content, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise Exception("이미지를 읽을 수 없습니다")

            height, width = image.shape[:2]
            if width > 800 or height > 800:
                scale = min(800/width, 800/height)
                image = cv2.resize(image, (int(width*scale), int(height*scale)))
                logger.info(f"이미지 크기 조정: {width}x{height} -> {image.shape[1]}x{image.shape[0]}")
            
            logger.info("EasyOCR 텍스트 추출 시작...")
            
            try:
                logger.info("📌 EasyOCR 실행 전 - 이미지 크기: %s", str(image.shape))
                
                start_time = time.time()
                
                results = reader.readtext(
                    image,
                    detail=0,
                    text_threshold=0.3,
                    link_threshold=0.3,
                    low_text=0.2
                )
                
                elapsed_time = time.time() - start_time
                logger.info("📌 EasyOCR 결과 추출 성공 - 결과 개수: %d", len(results))
                logger.info("⏱ OCR 실행 시간: %.2f초", elapsed_time)
                logger.debug("📌 OCR 결과 내용: %s", results)

            except Exception as e:
                logger.error("❌ EasyOCR 실행 중 오류 발생: %s", str(e))
                raise e

            if isinstance(results, list):
                extracted_text = " ".join(results)
            else:
                extracted_text = " ".join([text[1] for text in results])

            logger.info(f"OCR 결과: {len(results)}개 텍스트 블록 발견")
            logger.info(f"추출된 텍스트: {extracted_text[:200]}...")

            if not extracted_text.strip():
                raise HTTPException(status_code=500, detail="OCR에서 텍스트를 추출할 수 없습니다.")

        except Exception as ocr_error:
            logger.error(f"EasyOCR 처리 중 오류: {ocr_error}")
            logger.info("Tesseract OCR로 대체 시도...")

            try:
                extracted_text = extract_text_with_tesseract(image)
                if not extracted_text:
                    raise Exception("Tesseract OCR도 실패")
                logger.info("✅ Tesseract OCR로 텍스트 추출 성공")
            except Exception as tesseract_error:
                logger.error(f"Tesseract OCR도 실패: {tesseract_error}")
                raise HTTPException(status_code=500, detail=f"모든 OCR 처리 실패: {str(ocr_error)}")

        finally:
            try:
                if os.path.exists(image_path):
                    os.remove(image_path)
                    logger.info(f"임시 파일 삭제됨: {image_path}")
            except Exception as cleanup_error:
                logger.warning(f"임시 파일 삭제 실패: {cleanup_error}")

        if not extracted_text.strip():
            raise HTTPException(status_code=500, detail="OCR에서 텍스트를 추출할 수 없습니다.")

        extracted_text = extracted_text.replace('\n', ' ').replace('\r', ' ')
        extracted_text = ' '.join(extracted_text.split())

        menu_keywords = ['coffee', 'latte', 'cappuccino', 'americano', 'espresso',
                         'mocha', 'caramel', 'vanilla', 'chocolate', 'milk', 'cream', 'sugar', 'syrup', 'ice', 'hot',
                         '카페', '라떼', '카푸치노', '아메리카노', '에스프레소', '모카', '카라멜', '바닐라', '초콜릿', '우유', '크림', '설탕', '시럽', '아이스', '핫']

        meaningful_words = []
        for word in extracted_text.split():
            if any(k in word.lower() for k in menu_keywords):
                meaningful_words.append(word)
            elif not re.match(r'^[0-9~!@#$%^&*()_+\-=\[\]{};:\'"\\|,.<>/?]+$', word):
                meaningful_words.append(word)

        extracted_text = ' '.join(meaningful_words)
        logger.info(f"정제된 텍스트: {extracted_text}")

        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")

        analysis_result = ai_engine.analyze_menu_text(extracted_text, allergies_list)

        return JSONResponse(status_code=200, content={
            "success": True,
            "extracted_text": extracted_text,
            "analysis": analysis_result,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        import traceback
        logger.error(f"이미지 분석 중 오류: {e}")
        logger.error(f"오류 상세 정보: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-analyze")
async def batch_analyze_menus(
    menu_texts: List[str] = Body(...),
    user_allergies: Optional[List[str]] = Body(None)
):
    """여러 메뉴 일괄 분석"""
    try:
        logger.info(f"일괄 분석 요청: {len(menu_texts)}개 메뉴")
        
        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")
        
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
        
        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")
        
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
        
        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")
        
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
        
        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")
        
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
        if ai_engine is None:
            return {
                "success": False,
                "error": "AI 엔진이 초기화되지 않았습니다",
                "timestamp": datetime.now().isoformat()
            }
        
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
        
        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")
        
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
        if ai_engine is None:
            raise HTTPException(status_code=500, detail="AI 엔진이 초기화되지 않았습니다")
        
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
    logger.info("🚀 AI 서버 시작...")
    uvicorn.run(app, host="0.0.0.0", port=8000) 

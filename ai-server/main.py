from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import io
import os
from PIL import Image
import numpy as np
import cv2
import easyocr
from typing import List, Optional
import re
from googletrans import Translator

# 환경 변수 설정
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="알레르기 안전 메뉴 분석 AI 서버",
    description="OCR과 번역을 통한 메뉴 분석 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# EasyOCR 리더 초기화 (한국어, 영어, 일본어, 중국어 지원)
reader = easyocr.Reader(['ko', 'en', 'ja'], gpu=False)

# Google Translate 설정
translator = Translator()

class TranslationRequest(BaseModel):
    text: str
    source: str = "en"
    target: str = "ko"

class AnalysisRequest(BaseModel):
    image_url: str

def preprocess_image(image: np.ndarray) -> np.ndarray:
    """이미지 전처리 함수"""
    # 그레이스케일 변환
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    # 노이즈 제거
    denoised = cv2.fastNlMeansDenoising(gray)
    
    # 대비 향상
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(denoised)
    
    # 이진화
    _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return binary

def extract_text_with_easyocr(image: np.ndarray) -> List[dict]:
    """EasyOCR을 사용한 텍스트 추출"""
    try:
        # 이미지 전처리
        processed_image = preprocess_image(image)
        
        # EasyOCR로 텍스트 추출
        results = reader.readtext(processed_image)
        
        extracted_texts = []
        for (bbox, text, confidence) in results:
            if confidence > 0.5:  # 신뢰도 50% 이상만 사용
                extracted_texts.append({
                    'text': text,
                    'confidence': confidence,
                    'bbox': bbox
                })
        
        return extracted_texts
    except Exception as e:
        print(f"EasyOCR 오류: {e}")
        return []

def translate_text(text: str, source: str = "en", target: str = "ko") -> str:
    """Google Translate를 사용한 텍스트 번역"""
    try:
        # Google Translate로 번역
        result = translator.translate(text, src=source, dest=target)
        return result.text
    except Exception as e:
        print(f"번역 오류: {e}")
        return text

def analyze_menu_ingredients(extracted_text: str) -> dict:
    """추출된 텍스트에서 메뉴와 성분 분석"""
    try:
        # 카페 메뉴 데이터셋 로드
        with open('data/datasets/cafe_menu_dataset.json', 'r', encoding='utf-8') as f:
            menu_data = json.load(f)
        
        menu_items = []
        found_items = []
        
        # 추출된 텍스트를 줄별로 분석
        lines = extracted_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 메뉴 데이터셋과 매칭
            for menu_item in menu_data['menu_items']:
                # 메뉴 이름 매칭 (한글, 영어 모두)
                if (menu_item['name'].lower() in line.lower() or 
                    menu_item['english_name'].lower() in line.lower()):
                    
                    # 이미 찾은 메뉴인지 확인
                    if menu_item['id'] not in found_items:
                        found_items.append(menu_item['id'])
                        menu_items.append({
                            'id': menu_item['id'],
                            'name': menu_item['name'],
                            'english_name': menu_item['english_name'],
                            'category': menu_item['category'],
                            'ingredients': menu_item['ingredients'],
                            'allergens': menu_item['allergens'],
                            'description': menu_item['description'],
                            'matched_text': line
                        })
        
        return {
            'total_items_found': len(menu_items),
            'menu_items': menu_items,
            'raw_extracted_text': extracted_text
        }
        
    except Exception as e:
        print(f"메뉴 분석 오류: {e}")
        return {
            'total_items_found': 0,
            'menu_items': [],
            'raw_extracted_text': extracted_text
        }

@app.get("/")
async def root():
    return {
        "message": "알레르기 안전 메뉴 분석 AI 서버",
        "version": "1.0.0",
        "features": [
            "다중분류 OCR (EasyOCR)",
            "Google Translate 번역",
            "메뉴 성분 분석"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ocr_available": True,
        "translation_available": True
    }

@app.post("/ocr/extract")
async def extract_text(file: UploadFile = File(...)):
    """이미지에서 텍스트 추출"""
    try:
        # 이미지 파일 읽기
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image_np = np.array(image)
        
        # EasyOCR로 텍스트 추출
        ocr_results = extract_text_with_easyocr(image_np)
        
        # 추출된 텍스트들을 하나의 문자열로 결합
        extracted_text = '\n'.join([result['text'] for result in ocr_results])
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "ocr_results": ocr_results,
            "total_detections": len(ocr_results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR 처리 오류: {str(e)}")

@app.post("/translate")
async def translate_text_api(request: TranslationRequest):
    """텍스트 번역"""
    try:
        translated_text = translate_text(
            request.text, 
            request.source, 
            request.target
        )
        
        return {
            "success": True,
            "original_text": request.text,
            "translated_text": translated_text,
            "source": request.source,
            "target": request.target
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"번역 오류: {str(e)}")

@app.post("/menu/analyze")
async def analyze_menu(file: UploadFile = File(...)):
    """메뉴 이미지 분석 (OCR + 번역 + 성분 분석)"""
    try:
        # 1. 이미지에서 텍스트 추출
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image_np = np.array(image)
        
        ocr_results = extract_text_with_easyocr(image_np)
        extracted_text = '\n'.join([result['text'] for result in ocr_results])
        
        # 2. 영어 텍스트를 한국어로 번역
        translated_text = translate_text(extracted_text, "en", "ko")
        
        # 3. 메뉴 성분 분석
        analysis_result = analyze_menu_ingredients(translated_text)
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "translated_text": translated_text,
            "analysis_result": analysis_result,
            "ocr_confidence": {
                "high_confidence": len([r for r in ocr_results if r['confidence'] > 0.8]),
                "medium_confidence": len([r for r in ocr_results if 0.5 <= r['confidence'] <= 0.8]),
                "low_confidence": len([r for r in ocr_results if r['confidence'] < 0.5])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메뉴 분석 오류: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
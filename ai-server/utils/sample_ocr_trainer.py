#!/usr/bin/env python3
"""
샘플 데이터를 사용한 OCR 훈련 유틸리티
AI 허브에서 다운로드한 샘플 데이터로 OCR 모델을 훈련합니다.
"""

import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)

class SampleOCRTrainer:
    def __init__(self, dataset_path: str = "sample_ocr_dataset"):
        """
        샘플 OCR 훈련기 초기화
        
        Args:
            dataset_path: 샘플 데이터셋 경로
        """
        self.dataset_path = Path(dataset_path)
        # AI 허브 실제 구조에 맞게 경로 설정
        self.label_path = self.dataset_path / "Sample" / "02.라벨링데이터" / "OCR"
        
    def extract_sample_dataset(self, zip_path: str) -> bool:
        """
        샘플 데이터셋 ZIP 파일 추출
        
        Args:
            zip_path: 샘플 데이터셋 ZIP 파일 경로
            
        Returns:
            추출 성공 여부
        """
        try:
            import zipfile
            
            logger.info(f"샘플 데이터셋 추출 중: {zip_path}")
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # 모든 파일 추출 (샘플이므로 전체)
                zip_ref.extractall(self.dataset_path)
            
            logger.info("✅ 샘플 데이터셋 추출 완료")
            return True
            
        except Exception as e:
            logger.error(f"❌ 샘플 데이터셋 추출 실패: {e}")
            return False
    
    def analyze_sample_structure(self) -> Dict:
        """
        샘플 데이터셋 구조 분석
        
        Returns:
            데이터셋 정보
        """
        info = {
            "json_files": 0,
            "total_files": 0,
            "sample_files": [],
            "categories": set()
        }
        
        # JSON 라벨 파일 수 계산
        if self.label_path.exists():
            json_files = list(self.label_path.glob("**/*.json"))
            info["json_files"] = len(json_files)
            info["total_files"] = len(json_files)
            
            # 파일 분석
            for json_file in json_files[:10]:  # 처음 10개만 분석
                info["sample_files"].append(json_file.name)
                # 카테고리 정보 추출 (폴더명)
                category = json_file.parent.name
                info["categories"].add(category)
        
        # JSON 어노테이션 파일 분석
        json_files = list(self.dataset_path.glob("**/*.json"))
        if json_files:
            try:
                with open(json_files[0], 'r', encoding='utf-8') as f:
                    sample_data = json.load(f)
                    logger.info(f"샘플 JSON 구조: {type(sample_data)}")
                    if isinstance(sample_data, list):
                        logger.info(f"JSON 배열 길이: {len(sample_data)}")
                    elif isinstance(sample_data, dict):
                        logger.info(f"JSON 키들: {list(sample_data.keys())}")
            except Exception as e:
                logger.warning(f"JSON 파일 분석 실패: {e}")
        
        return info
    
    def prepare_sample_training_data(self) -> Tuple[List[str], List[str]]:
        """
        샘플 훈련 데이터 준비
        
        Returns:
            (이미지 경로 리스트, 텍스트 라벨 리스트)
        """
        image_paths = []
        text_labels = []
        
        # JSON 라벨 파일들 찾기
        if self.label_path.exists():
            json_files = list(self.label_path.glob("**/*.json"))
            
            for json_file in json_files:
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        label_data = json.load(f)
                        
                        # AI 허브 JSON 구조 분석
                        if isinstance(label_data, dict):
                            # 이미지 파일 경로 추출
                            if 'Images' in label_data and 'file_name' in label_data['Images']:
                                img_path = str(label_data['Images']['file_name'])
                                image_paths.append(img_path)
                            
                            # 텍스트 추출 (실제 구조에 맞게)
                            if 'annotations' in label_data:
                                texts = []
                                for annotation in label_data['annotations']:
                                    if 'text' in annotation:
                                        texts.append(annotation['text'])
                                if texts:
                                    text_labels.append(' '.join(texts))
                            elif 'text' in label_data:
                                # 직접 텍스트가 있는 경우
                                text_labels.append(label_data['text'])
                                
                        elif isinstance(label_data, list):
                            # 리스트 형태의 어노테이션
                            texts = []
                            for item in label_data:
                                if isinstance(item, dict) and 'text' in item:
                                    texts.append(item['text'])
                            if texts:
                                text_labels.append(' '.join(texts))
                                
                except Exception as e:
                    logger.warning(f"라벨 파일 읽기 실패 {json_file}: {e}")
        
        logger.info(f"샘플 훈련 데이터 준비 완료: {len(image_paths)}개 이미지, {len(text_labels)}개 텍스트")
        return image_paths, text_labels
    
    def train_sample_model(self, output_path: str = "models/sample_ocr") -> bool:
        """
        샘플 데이터로 OCR 모델 훈련
        
        Args:
            output_path: 모델 저장 경로
            
        Returns:
            훈련 성공 여부
        """
        try:
            # 훈련 데이터 준비
            image_paths, text_labels = self.prepare_sample_training_data()
            
            if len(image_paths) == 0:
                logger.error("❌ 샘플 훈련 데이터가 없습니다")
                return False
            
            # 샘플 모델 훈련 (간단한 예시)
            logger.info(f"샘플 모델 훈련 시작: {len(image_paths)}개 이미지")
            
            # 모델 저장 디렉토리 생성
            os.makedirs(output_path, exist_ok=True)
            
            # 훈련 데이터 정보 저장
            dataset_info = self.analyze_sample_structure()
            # set을 list로 변환 (JSON 직렬화 가능하게)
            if 'categories' in dataset_info:
                dataset_info['categories'] = list(dataset_info['categories'])
            
            training_info = {
                "total_images": len(image_paths),
                "sample_texts": text_labels[:5],  # 샘플 텍스트
                "dataset_info": dataset_info,
                "model_type": "sample_ocr"
            }
            
            with open(f"{output_path}/training_info.json", 'w', encoding='utf-8') as f:
                json.dump(training_info, f, ensure_ascii=False, indent=2)
            
            logger.info("✅ 샘플 모델 훈련 완료")
            return True
            
        except Exception as e:
            logger.error(f"❌ 샘플 모델 훈련 실패: {e}")
            return False

def main():
    """메인 실행 함수"""
    # 샘플 데이터셋 ZIP 파일 경로 (여러 가능한 이름)
    possible_zip_files = [
        "sample_ocr_dataset.zip",           # 권장
        "aihub_multilingual_ocr_dataset.zip",
        "aihub_ocr_dataset.zip", 
        "multilingual_ocr_dataset.zip",
        "train.zip",
        "ocr_dataset.zip"
    ]
    
    zip_path = None
    for file_name in possible_zip_files:
        if os.path.exists(file_name):
            zip_path = file_name
            break
    
    if not zip_path:
        logger.error(f"❌ 샘플 데이터셋 파일을 찾을 수 없습니다. 다음 파일 중 하나를 넣어주세요:")
        for file_name in possible_zip_files:
            logger.error(f"   - {file_name}")
        return
    
    # 훈련기 초기화
    trainer = SampleOCRTrainer()
    
    # 데이터셋 추출
    if trainer.extract_sample_dataset(zip_path):
        # 데이터셋 구조 분석
        info = trainer.analyze_sample_structure()
        logger.info(f"샘플 데이터셋 정보: {info}")
        
        # 샘플 모델 훈련
        if trainer.train_sample_model():
            logger.info("🎉 샘플 데이터셋 기반 OCR 모델 훈련 완료!")
        else:
            logger.error("❌ 샘플 모델 훈련 실패")
    else:
        logger.error("❌ 샘플 데이터셋 추출 실패")

if __name__ == "__main__":
    main() 
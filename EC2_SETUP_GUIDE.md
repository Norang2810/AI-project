# EC2 최적화 프로젝트 설정 가이드

## 🎯 최적화 내용

### 제거된 파일들 (용량 절약)
- `sample_ocr_dataset.zip` (555MB)
- `sample_ocr_dataset/` 폴더 (~100MB)
- `train_models.py` (학습 코드)
- `test_models.py` (테스트 코드)
- `utils/sample_ocr_trainer.py` (학습기)
- `utils/real_ocr_trainer.py` (학습기)

### 유지된 파일들 (실행 필수)
- ✅ 모든 `.pkl` 모델 파일들 (추론용)
- ✅ EasyOCR 모델 파일들 (OCR 기능)
- ✅ `main.py` (메인 서버)
- ✅ 모든 AI 분석 모델들

## 🚀 EC2 실행 방법

### 1. 프로젝트 업로드
```bash
# EC2에 프로젝트 업로드
scp -r my-web/ ubuntu@your-ec2-ip:/home/ubuntu/
```

### 2. 환경 설정
```bash
# EC2 접속
ssh ubuntu@your-ec2-ip

# 프로젝트 디렉토리로 이동
cd my-web/docker

# 실행 권한 부여
chmod +x start-ec2-optimized.sh
```

### 3. 환경 변수 설정
```bash
# 환경 변수 편집
nano start-ec2-optimized.sh

# 다음 부분을 실제 값으로 변경:
export DB_PASSWORD="your_secure_password_here"
export JWT_SECRET="your_jwt_secret_here"
```

### 4. 프로젝트 실행
```bash
# 최적화된 프로젝트 시작
./start-ec2-optimized.sh
```

## 📊 예상 용량 절약

- **기존 용량**: ~2.5GB
- **최적화 후 용량**: ~1.8GB
- **절약 용량**: ~700MB

## 🔧 추가 최적화 옵션

### 메모리 제한 설정
```yaml
# docker-compose-optimized.yml에서
ai-server:
  deploy:
    resources:
      limits:
        memory: 1.5G  # 메모리 제한
```

### 로그 로테이션
```bash
# Docker 로그 크기 제한
docker run --log-opt max-size=10m --log-opt max-file=3
```

## 🐛 문제 해결

### 디스크 용량 확인
```bash
df -h
```

### Docker 용량 확인
```bash
docker system df
```

### 컨테이너 로그 확인
```bash
docker-compose -f docker-compose-optimized.yml logs ai-server
```

## 📝 주의사항

1. **모델 학습은 Google Colab에서 진행**
2. **학습된 모델 파일들(.pkl)은 반드시 유지**
3. **EasyOCR 기능은 그대로 유지됨**
4. **추론 성능에는 영향 없음**

## 🎉 완료!

이제 EC2에서 용량을 크게 절약하면서도 모든 기능이 정상적으로 작동하는 최적화된 프로젝트를 실행할 수 있습니다!

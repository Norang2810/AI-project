<div align="center">

# 🌿 **알쥬알쥬**  
### _AI 기반 메뉴 분석 및 알레르기 위험도 예측 서비스_

---

**📅 기간** | 2025.07 ~ 2025.08    
**🏢 진행 기관** | ㈜유큐브 ,스마트인재개발원  

## ⚙️ 기술 스택

<div align="center">

<!-- Frontend -->
<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/>  

<!-- Backend -->
<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white"/> 
<img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white"/> 
<img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/>  

<!-- AI Server -->
<img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white"/>  
<img src="https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white"/> 
<img src="https://img.shields.io/badge/EasyOCR-FFD43B?style=flat-square&logo=python&logoColor=black"/> 
<img src="https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white"/> 
<img src="https://img.shields.io/badge/pandas-150458?style=flat-square&logo=pandas&logoColor=white"/>  

<!-- Database -->
<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white"/>  

<!-- Infra -->
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/> 
<img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white"/> 
<img src="https://img.shields.io/badge/AWS%20EC2-FF9900?style=flat-square&logo=amazon-ec2&logoColor=white"/> 
<img src="https://img.shields.io/badge/SSL%20(Let's%20Encrypt)-003A70?style=flat-square&logo=letsencrypt&logoColor=white"/>  

</div>


---

## **프로젝트 개요**

메뉴 이미지를 AI로 분석하여  
사용자 알레르기 정보를 기반으로 **위험도를 예측하고 유사 메뉴를 추천하는 웹 서비스**입니다.  
OCR + 텍스트 분석 + ML 모델을 결합해 실생활 문제(알레르기 식단 선택)를 해결합니다.

---

## 👥 **팀 구성 및 역할**

<div align="center">

<img width="700" height="500" alt="image" src="https://github.com/user-attachments/assets/ed8be1e0-6958-4d3c-8c5c-a25aeaacedfe" />


</div>

---

## **시스템 아키텍처**

<div align="center">

<img width="700" height="500" alt="image" src="https://github.com/user-attachments/assets/81d8aaaf-1929-4ca7-afc4-f1c8034fc12b" />  


</div>  

>React → Node.js → FastAPI → MySQL로 구성된 3계층 분산 아키텍처입니다.    
>각 서비스는 Docker Compose로 컨테이너화되어 AWS EC2 환경에서 Nginx Reverse Proxy + HTTPS(SSL) 기반으로 통합 배포되었습니다.
 

---

##  **ERD**

<div align="center">

<img width="700" height="500" alt="image" src="https://github.com/user-attachments/assets/81929ffb-8ebd-4076-8bb3-2098d80159da" />


</div>  

> 사용자·메뉴·분석결과 테이블을 중심으로 데이터 일관성을 유지하도록 설계  


## 💡 **핵심 기능**
- **반응형 웹**
- **OCR 기반 메뉴 이미지 분석 및 텍스트 정규화**
- **AI 모델을 활용한 알레르기 위험도 예측**
- **TF-IDF 기반 유사 메뉴 추천 기능**
- **사용자별 알레르기 정보 등록·관리**
- **Docker 기반 멀티 컨테이너 통합 배포**

---

##  **성과 및 역할 요약**

- 백엔드 및 AI 서버 통합 아키텍처 직접 설계 및 배포  
- JWT 기반 사용자 인증·보안 로직 구현  
- 데이터 전처리 및 모델 성능 개선 (정확도 92%)  
- 팀 협업 리딩, Git Flow·코드 리뷰 프로세스 운영

---


<div align="center">

> _“팀을 이끌며 기술적 문제를 함께 해결하고, 협업의 가치를 배웠습니다.”_

</div>

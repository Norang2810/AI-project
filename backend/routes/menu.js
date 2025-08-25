const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
// const sharp = require('sharp'); // 임시로 주석 처리
const { MenuAnalysis, UserAllergy } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 이미지 리사이징 함수 (임시로 비활성화)
async function resizeImage(filePath, maxWidth = 800, maxHeight = 800) {
  try {
    // 임시로 원본 파일 그대로 반환
    console.log('이미지 리사이징 비활성화됨');
    return filePath;
  } catch (error) {
    console.error('이미지 리사이징 오류:', error);
    return filePath; // 오류 발생 시 원본 파일 반환
  }
}

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  // 업로드 제한 상향 (기본 Nginx 20MB와 보조를 맞춤)
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다!'));
    }
  }
});

// 메뉴 분석 API
router.post('/analyze', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: '이미지 파일이 필요합니다.' 
      });
    }

    // 사용자 알레르기 정보 가져오기
    const userId = req.user.id;
    const userAllergies = await UserAllergy.findAll({
      where: { userId },
      attributes: ['allergyName']
    });
    
    const allergyNames = userAllergies.map(allergy => allergy.allergyName);

    // 이미지 리사이징 적용
    console.log('이미지 리사이징 시작...');
    const resizedImagePath = await resizeImage(req.file.path, 800, 800);
    console.log('이미지 리사이징 완료:', resizedImagePath);

    // AI 서버로 이미지 전송 (axios 사용)
    const formData = new FormData();
    
    // 파일을 Buffer로 읽어서 추가 (리사이징된 이미지 사용)
    const fileBuffer = fs.readFileSync(resizedImagePath);
    formData.append('file', fileBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // FormData에 알레르기 정보 추가
    if (allergyNames.length > 0) {
      formData.append('user_allergies', allergyNames.join(','));
    }

    console.log('AI 서버로 요청 전송 중...');
    console.log('파일 정보:', {
      filename: req.file.originalname,
      size: fileBuffer.length,
      mimetype: req.file.mimetype
    });
    
    // 재시도 로직 추가
    let aiResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const aiServerUrl = process.env.AI_SERVER_URL || 'http://ai-server:8000';
        aiResponse = await axios.post(`${aiServerUrl}/analyze-image`, formData, {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 600000 // 10분 타임아웃
        });
        break; // 성공하면 루프 종료
      } catch (error) {
        retryCount++;
        console.error(`AI 서버 요청 실패 (${retryCount}/${maxRetries}):`, error.message);
        
        if (retryCount >= maxRetries) {
          throw new Error(`AI 서버 연결 실패 (${maxRetries}회 시도): ${error.message}`);
        }
        
        // 재시도 전 2초 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('AI 서버 응답 상태:', aiResponse.status, aiResponse.statusText);

    if (aiResponse.status !== 200) {
      console.error('AI 서버 오류:', aiResponse.data);
      throw new Error(`AI 서버 분석 실패: ${aiResponse.status} - ${JSON.stringify(aiResponse.data)}`);
    }

    const aiResult = aiResponse.data;
    console.log('AI 서버 응답:', JSON.stringify(aiResult, null, 2));
    
    // 🤖 Gemini API로 메뉴명 완성 (무조건 호출)
    let finalResult = aiResult;
    console.log('🚀 Gemini API로 메뉴명 완성 시작...');
    
    try {
      const geminiPrompt = `
      다음은 카페 메뉴판에서 OCR로 추출된 텍스트입니다.
      
      원본 텍스트: ${aiResult.extracted_text}
      번역된 텍스트: ${aiResult.translated_text || '번역 없음'}
      
      이 텍스트를 분석하여 카페 음료 메뉴명들을 정확하게 추출해주세요.
      다음 형식으로 JSON 배열로 응답해주세요:
      ["메뉴명1", "메뉴명2", "메뉴명3"]
      
      주의사항:
      - 음료 메뉴명만 추출 (커피, 차, 주스, 스무디 등)
      - 가격, 설명, 기타 정보는 제외
      - 정확하지 않은 텍스트는 제외
      - 최대 10개까지 추출
      - 한글로 응답 (가능한 경우)
      `;
      
      const geminiResponse = await axios.post('http://localhost:3000/api/gemini/enhance', {
        prompt: geminiPrompt,
        text: aiResult.extracted_text,
        maxTokens: 300
      }, {
        timeout: 30000
      });
      
      if (geminiResponse.data.success && geminiResponse.data.enhancedText) {
        try {
          const enhancedText = JSON.parse(geminiResponse.data.enhancedText);
          if (Array.isArray(enhancedText) && enhancedText.length > 0) {
            // Gemini API로 보완된 텍스트로 결과 업데이트
            finalResult = {
              ...aiResult,
              enhanced_text: enhancedText.join(' '),
              enhanced_by_gemini: true
            };
            console.log('✅ Gemini API로 메뉴명 완성 완료:', enhancedText);
          }
        } catch (parseError) {
          console.warn('⚠️ Gemini API 응답을 JSON으로 파싱할 수 없음:', parseError);
        }
      }
    } catch (geminiError) {
      console.warn('⚠️ Gemini API 호출 실패:', geminiError.message);
    }
    
    // 분석 결과를 상세하게 가공
    const detailedAnalysis = await processAnalysisResult(finalResult, allergyNames, userId, req.file.path);
    
    // 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: '분석이 완료되었습니다!',
      analysis: detailedAnalysis
    });

  } catch (error) {
    console.error('메뉴 분석 오류:', error);
    
    // 임시 파일 정리
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: '분석 중 오류가 발생했습니다.' 
    });
  }
});

// 분석 결과 가공 함수
async function processAnalysisResult(aiResult, userAllergies,userId, imageUrl) {
  console.log('processAnalysisResult 입력:', { aiResult, userAllergies });
  
  if (!aiResult || !aiResult.analysis) {
    console.error('AI 결과 형식 오류:', aiResult);
    return {
      extractedText: aiResult?.extracted_text || '텍스트 추출 실패',
      enhancedText: aiResult?.enhanced_text || null,
      menuAnalysis: [],
      userAllergies: userAllergies,
      timestamp: new Date().toISOString(),
      error: '분석 결과 형식 오류'
    };
  }

  try {
    await MenuAnalysis.create({
      userId: userId,
      imageUrl: imageUrl,
      extractedText: aiResult.extracted_text,
      translatedText: aiResult.translated_text || null,
      analysisResult: aiResult.analysis, // 그대로 JSON으로 저장
    });

    console.log('✅ MenuAnalysis DB 저장 성공');
  } catch (error) {
    console.error('❌ MenuAnalysis DB 저장 실패:', error);
  }
  
  const analysis = aiResult.analysis;
  
  // 메뉴별 상세 분석 결과
  const menuAnalysis = [];
  
  if (analysis.menu_classification) {
    menuAnalysis.push({
      type: 'classification',
      data: analysis.menu_classification
    });
  }
  
  if (analysis.ingredient_analysis) {
    const ingredients = analysis.ingredient_analysis.extracted_ingredients || [];
    const riskAnalysis = analyzeIngredientRisk(ingredients, userAllergies);
    
    menuAnalysis.push({
      type: 'ingredients',
      data: {
        ingredients: ingredients,
        riskAnalysis: riskAnalysis
      }
    });
  }
  
  if (analysis.allergy_risk) {
    const riskLevel = analysis.allergy_risk.final_risk_level;
    const riskInfo = getRiskLevelInfo(riskLevel);
    
    menuAnalysis.push({
      type: 'risk_assessment',
      data: {
        riskLevel: riskLevel,
        riskInfo: riskInfo,
        mlPrediction: analysis.allergy_risk.ml_prediction,
        ruleBasedAnalysis: analysis.allergy_risk.rule_based_analysis
      }
    });
  }
  
  if (analysis.recommendations) {
    menuAnalysis.push({
      type: 'recommendations',
      data: analysis.recommendations
    });
  }
  
  return {
    extractedText: aiResult.extracted_text,
    enhancedText: aiResult.enhanced_text || null,
    menuAnalysis: menuAnalysis,
    userAllergies: userAllergies,
    timestamp: new Date().toISOString()
  };
}

// 성분 위험도 분석
function analyzeIngredientRisk(ingredients, userAllergies) {
  const riskAnalysis = {
    safe: [],
    warning: [],
    danger: [],
    totalIngredients: ingredients.length
  };
  
  ingredients.forEach(ingredient => {
    const isAllergic = userAllergies.some(allergy => 
      ingredient.toLowerCase().includes(allergy.toLowerCase())
    );
    
    if (isAllergic) {
      riskAnalysis.danger.push({
        ingredient: ingredient,
        matchedAllergies: userAllergies.filter(allergy => 
          ingredient.toLowerCase().includes(allergy.toLowerCase())
        )
      });
    } else {
      riskAnalysis.safe.push(ingredient);
    }
  });
  
  return riskAnalysis;
}

// 위험도 레벨 정보
function getRiskLevelInfo(riskLevel) {
  const riskInfo = {
    safe: {
      level: 'safe',
      color: '#10B981',
      icon: '🟢',
      title: '안전',
      description: '알레르기 성분이 포함되지 않았습니다.',
      severity: 'low'
    },
    low_risk: {
      level: 'low_risk',
      color: '#F59E0B',
      icon: '🟡',
      title: '주의',
      description: '잠재적 알레르기 성분이 포함될 수 있습니다.',
      severity: 'medium'
    },
    high_risk: {
      level: 'high_risk',
      color: '#EF4444',
      icon: '🔴',
      title: '위험',
      description: '알레르기 성분이 포함되어 있습니다.',
      severity: 'high'
    },
    dangerous: {
      level: 'dangerous',
      color: '#DC2626',
      icon: '🚨',
      title: '매우 위험',
      description: '다량의 알레르기 성분이 포함되어 있습니다.',
      severity: 'critical'
    }
  };
  
  return riskInfo[riskLevel] || riskInfo.safe;
}

module.exports = router; 
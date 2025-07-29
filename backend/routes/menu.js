const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { MenuAnalysis, UserAllergy } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
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

    // AI 서버로 이미지 전송 (axios 사용)
    const formData = new FormData();
    
    // 파일을 Buffer로 읽어서 추가
    const fileBuffer = fs.readFileSync(req.file.path);
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
    
    const aiResponse = await axios.post('http://localhost:8000/analyze-image', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('AI 서버 응답 상태:', aiResponse.status, aiResponse.statusText);

    if (aiResponse.status !== 200) {
      console.error('AI 서버 오류:', aiResponse.data);
      throw new Error(`AI 서버 분석 실패: ${aiResponse.status} - ${JSON.stringify(aiResponse.data)}`);
    }

    const aiResult = aiResponse.data;
    console.log('AI 서버 응답:', JSON.stringify(aiResult, null, 2));
    
    // 분석 결과를 상세하게 가공
    const detailedAnalysis = processAnalysisResult(aiResult, allergyNames);
    
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
function processAnalysisResult(aiResult, userAllergies) {
  console.log('processAnalysisResult 입력:', { aiResult, userAllergies });
  
  if (!aiResult || !aiResult.analysis) {
    console.error('AI 결과 형식 오류:', aiResult);
    return {
      extractedText: aiResult?.extracted_text || '텍스트 추출 실패',
      menuAnalysis: [],
      userAllergies: userAllergies,
      timestamp: new Date().toISOString(),
      error: '분석 결과 형식 오류'
    };
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
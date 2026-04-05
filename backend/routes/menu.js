const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { Op } = require('sequelize');
// const sharp = require('sharp'); // 임시로 주석 처리
const { UserAllergy } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { geminiEnhanceUrl } = require('../config/runtime');
const {
  createCompletedAnalysisArtifacts,
  createFailedAnalysisJob,
} = require('../services/analysisPersistence');

const router = express.Router();
const AI_REQUEST_TIMEOUT_MS = 600000;
const AI_REQUEST_MAX_RETRIES = 3;
const AI_REQUEST_RETRY_DELAY_MS = 2000;
const GEMINI_TIMEOUT_MS = 30000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAiServerUrl = () => process.env.AI_SERVER_URL || 'http://ai-server:8000';

const createAnalyzeFormData = ({ filePath, originalFilename, mimeType, allergyNames }) => {
  const formData = new FormData();

  formData.append('file', fs.createReadStream(filePath), {
    filename: originalFilename,
    contentType: mimeType,
  });

  if (allergyNames.length > 0) {
    formData.append('user_allergies', allergyNames.join(','));
  }

  return formData;
};

const fetchUserAllergyNames = async (userId) => {
  const userAllergies = await UserAllergy.findAll({
    where: { userId },
    attributes: ['allergyName'],
  });

  return userAllergies.map((allergy) => allergy.allergyName);
};

const requestAiAnalysis = async ({ filePath, originalFilename, mimeType, allergyNames }) => {
  const aiServerUrl = getAiServerUrl();

  console.log('Sending analyze request to AI server:', {
    aiServerUrl,
    filename: originalFilename,
    mimeType,
    allergyCount: allergyNames.length,
  });

  for (let attempt = 1; attempt <= AI_REQUEST_MAX_RETRIES; attempt += 1) {
    const formData = createAnalyzeFormData({
      filePath,
      originalFilename,
      mimeType,
      allergyNames,
    });

    try {
      const response = await axios.post(`${aiServerUrl}/analyze-image`, formData, {
        headers: formData.getHeaders(),
        timeout: AI_REQUEST_TIMEOUT_MS,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        throw new Error(
          `AI server analyze failed: ${response.status} - ${JSON.stringify(response.data)}`
        );
      }

      console.log('AI server response status:', response.status);
      return response.data;
    } catch (error) {
      console.error(
        `AI analyze request failed (${attempt}/${AI_REQUEST_MAX_RETRIES}):`,
        error.message
      );

      if (attempt === AI_REQUEST_MAX_RETRIES) {
        throw new Error(
          `AI server connection failed after ${AI_REQUEST_MAX_RETRIES} attempts: ${error.message}`
        );
      }

      await sleep(AI_REQUEST_RETRY_DELAY_MS);
    }
  }

  throw new Error('AI server request exhausted retries without a result');
};

const shouldRunGeminiEnhancement = (aiResult) =>
  Boolean(aiResult?.extracted_text) && !aiResult?.translated_text;

const buildGeminiPrompt = (aiResult) => `
당신은 카페 메뉴 OCR 후처리 전문가입니다. OCR에서 추출된 텍스트를 보고 음료 메뉴명만 최대 15개까지 정리하세요.

입력 텍스트:
${aiResult.extracted_text}

응답 규칙:
1. 반드시 JSON 배열만 반환합니다.
2. 음료 메뉴명만 남기고 가격, 설명, 기타 문구는 제거합니다.
3. 확신이 낮더라도 텍스트 기반으로 가장 가능성 높은 메뉴명을 추정합니다.
4. 중복은 제거합니다.

예시 응답:
["아메리카노", "카페라떼", "카푸치노"]
`;

const maybeEnhanceMenusWithGemini = async (aiResult) => {
  if (!shouldRunGeminiEnhancement(aiResult)) {
    return aiResult;
  }

  console.log('Gemini menu enhancement started because translated_text is missing');

  try {
    const geminiResponse = await axios.post(
      geminiEnhanceUrl,
      {
        prompt: buildGeminiPrompt(aiResult),
        text: aiResult.extracted_text,
        maxTokens: 300,
      },
      {
        timeout: GEMINI_TIMEOUT_MS,
      }
    );

    if (!geminiResponse.data.success || !geminiResponse.data.enhancedText) {
      return aiResult;
    }

    const enhancedText = JSON.parse(geminiResponse.data.enhancedText);
    if (!Array.isArray(enhancedText) || enhancedText.length === 0) {
      return aiResult;
    }

    console.log('Gemini menu enhancement completed:', enhancedText);

    return {
      ...aiResult,
      enhanced_text: enhancedText.join(' '),
      enhanced_by_gemini: true,
    };
  } catch (error) {
    console.warn('Gemini menu enhancement failed:', error.message);
    return aiResult;
  }
};

const queueMenuAnalysisSave = (payload) => {
  setImmediate(() => {
    createCompletedAnalysisArtifacts(payload).catch((error) => {
      console.error('Unexpected MenuAnalysis persistence error:', error);
    });
  });
};

const queueFailedAnalysisSave = (payload) => {
  setImmediate(() => {
    createFailedAnalysisJob(payload).catch((error) => {
      console.error('Unexpected analysis failure persistence error:', error);
    });
  });
};

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
    try {
      // 한글 파일명 인코딩 문제 해결 - 여러 방법 시도
      let originalName = file.originalname;
      
      // 방법 1: Buffer 변환 시도
      try {
        originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      } catch (e) {
        console.log('Buffer 변환 실패, 원본 사용:', file.originalname);
      }
      
      // 방법 2: decodeURIComponent 시도
      try {
        if (originalName.includes('%')) {
          originalName = decodeURIComponent(originalName);
        }
      } catch (e) {
        console.log('decodeURIComponent 실패:', e.message);
      }
      
      const timestamp = Date.now();
      const extension = path.extname(originalName);
      const nameWithoutExt = path.basename(originalName, extension);
      
      // 파일명을 안전한 형태로 변환
      let safeName = nameWithoutExt
        .replace(/[^\w\s가-힣]/g, '_')  // 특수문자를 언더스코어로
        .replace(/\s+/g, '_')           // 공백을 언더스코어로
        .replace(/_+/g, '_')            // 연속된 언더스코어를 하나로
        .trim();
      
      // 한글이 모두 제거된 경우 기본값 사용
      if (!safeName || safeName === '_') {
        safeName = 'menu_image';
      }
      
      const finalName = `${timestamp}-${safeName}${extension}`;
      
      console.log('파일명 처리:', {
        original: file.originalname,
        processed: finalName,
        safeName: safeName
      });
      
      cb(null, finalName);
    } catch (error) {
      console.error('파일명 처리 중 오류:', error);
      // 오류 발생 시 기본 파일명 사용
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      cb(null, `${timestamp}-menu_image${extension}`);
    }
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
  const requestStartedAt = new Date();
  let userId = req.user?.id || null;
  let fileInfo = null;
  let aiLatencyMs = 0;
  let geminiLatencyMs = 0;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 필요합니다.',
      });
    }

    const analyzeStartedAt = Date.now();
    userId = req.user.id;
    fileInfo = {
      imageUrl: req.file.path,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };

    const [allergyNames, resizedImagePath] = await Promise.all([
      fetchUserAllergyNames(userId),
      resizeImage(req.file.path, 800, 800),
    ]);

    const aiStartedAt = Date.now();
    const aiResult = await requestAiAnalysis({
      filePath: resizedImagePath,
      originalFilename: fileInfo.originalFilename,
      mimeType: fileInfo.mimeType,
      allergyNames,
    });
    aiLatencyMs = Date.now() - aiStartedAt;

    const geminiStartedAt = Date.now();
    const finalResult = await maybeEnhanceMenusWithGemini(aiResult);
    geminiLatencyMs = Date.now() - geminiStartedAt;
    const detailedAnalysis = processAnalysisResult(finalResult, allergyNames);

    const requestCompletedAt = new Date();
    const requestLatencyMs = Date.now() - analyzeStartedAt;

    console.log('Menu analyze response ready in ms:', requestLatencyMs);

    res.json({
      success: true,
      message: '분석이 완료되었습니다!',
      analysis: detailedAnalysis,
    });

    queueMenuAnalysisSave({
      aiResult: finalResult,
      userId,
      userAllergies: allergyNames,
      imageUrl: fileInfo.imageUrl,
      originalFilename: fileInfo.originalFilename,
      fileSize: fileInfo.fileSize,
      metrics: {
        startedAt: requestStartedAt,
        completedAt: requestCompletedAt,
        requestLatencyMs,
        aiLatencyMs,
        geminiLatencyMs,
      },
    });

  } catch (error) {
    console.error('메뉴 분석 오류:', error);
    const requestCompletedAt = new Date();
    const requestLatencyMs = Math.max(0, requestCompletedAt.getTime() - requestStartedAt.getTime());
    
    // 에러 발생 시에만 임시 파일 정리
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: '분석 중 오류가 발생했습니다.' 
    });

    queueFailedAnalysisSave({
      userId,
      imageUrl: fileInfo?.imageUrl || null,
      originalFilename: fileInfo?.originalFilename || null,
      fileSize: fileInfo?.fileSize || null,
      errorMessage: error.message,
      metrics: {
        startedAt: requestStartedAt,
        completedAt: requestCompletedAt,
        requestLatencyMs,
        aiLatencyMs,
        geminiLatencyMs,
      },
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
      enhancedText: aiResult?.translated_text || aiResult?.enhanced_text || null,
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
    enhancedText: aiResult.translated_text || aiResult.enhanced_text || null,
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

// 사용자별 분석 내역 조회 API
router.get('/user-analyses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5; // 기본값 5개
    
    // 최신 분석 내역 조회 (최신 5개)
    const analyses = await MenuAnalysis.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']], // 최신순 정렬
      limit: limit,
      attributes: [
        'id',
        'imageUrl',
        'originalFilename',
        'fileSize',
        'extractedText',
        'translatedText',
        'analysisResult',
        'createdAt'
      ]
    });

    // 총 분석 개수 조회
    const totalCount = await MenuAnalysis.count({
      where: { userId }
    });

    // 분석 결과 가공
    const formattedAnalyses = analyses.map(analysis => {
      const analysisData = analysis.analysisResult || {};
      
      return {
        id: analysis.id,
        imageUrl: analysis.imageUrl,
        originalFilename: analysis.originalFilename,
        fileSize: analysis.fileSize,
        extractedText: analysis.extractedText,
        translatedText: analysis.translatedText,
        menuName: analysisData.menu_classification?.predicted_menu || analysis.originalFilename || '메뉴명 없음',
        riskLevel: analysisData.allergy_risk?.final_risk_level || 'unknown',
        allergens: analysisData.ingredient_analysis?.extracted_ingredients || [],
        createdAt: analysis.createdAt,
        analysisData: analysisData
      };
    });

    res.json({
      success: true,
      data: {
        analyses: formattedAnalyses,
        totalCount: totalCount,
        currentLimit: limit
      }
    });

  } catch (error) {
    console.error('사용자 분석 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '분석 내역 조회 중 오류가 발생했습니다.'
    });
  }
});

// 오래된 분석 내역 제거 API (최신 5개 유지)
router.delete('/cleanup-old-analyses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const keepLimit = parseInt(req.query.keep) || 5; // 유지할 개수
    
    // 최신 분석 내역 ID들 조회
    const recentAnalyses = await MenuAnalysis.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: keepLimit,
      attributes: ['id']
    });
    
    const recentIds = recentAnalyses.map(analysis => analysis.id);
    
    // 오래된 분석 내역 삭제
    const deletedCount = await MenuAnalysis.destroy({
      where: {
        userId: userId,
        id: { [Op.notIn]: recentIds }
      }
    });

    // 삭제된 이미지 파일들도 정리
    if (deletedCount > 0) {
      const oldAnalyses = await MenuAnalysis.findAll({
        where: {
          userId: userId,
          id: { [Op.notIn]: recentIds }
        },
        attributes: ['imageUrl']
      });

      oldAnalyses.forEach(analysis => {
        if (analysis.imageUrl && fs.existsSync(analysis.imageUrl)) {
          try {
            fs.unlinkSync(analysis.imageUrl);
            console.log('삭제된 이미지 파일:', analysis.imageUrl);
          } catch (fileError) {
            console.warn('이미지 파일 삭제 실패:', analysis.imageUrl, fileError.message);
          }
        }
      });
    }

    res.json({
      success: true,
      message: `${deletedCount}개의 오래된 분석 내역이 정리되었습니다.`,
      data: {
        deletedCount: deletedCount,
        keptCount: recentIds.length
      }
    });

  } catch (error) {
    console.error('오래된 분석 내역 정리 오류:', error);
    res.status(500).json({
      success: false,
      message: '분석 내역 정리 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 

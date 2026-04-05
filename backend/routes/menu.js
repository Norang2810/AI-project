const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { Op } = require('sequelize');
// const sharp = require('sharp'); // 임시로 주석 처리
const { MenuAnalysis, UserAllergy } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { geminiEnhanceUrl } = require('../config/runtime');

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
        console.log('🔍 AI 서버 URL:', aiServerUrl);
        console.log('🔍 환경변수 AI_SERVER_URL:', process.env.AI_SERVER_URL);
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
당신은 카페 메뉴판 전문 분석가입니다. OCR로 추출된 불완전한 텍스트를 분석하여 정확한 카페 음료 메뉴명을 추출해야 합니다.

**입력 텍스트:**
${aiResult.extracted_text}

**번역된 텍스트:**
${aiResult.translated_text || '번역 없음'}

**임무:**
OCR에서 추출된 텍스트를 분석하여 카페 음료 메뉴명만을 정확하게 추출하세요.

**카페 음료 메뉴 패턴 (포괄적):**
- **커피류**: 아메리카노, 라떼, 카푸치노, 에스프레소, 모카, 마끼아또, 콜드브루, 코르타도
- **차류**: 홍차, 녹차, 우롱차, 허브티, 레몬티, 페퍼민트티, 차이티, 브렉퍼스트티
- **주스류**: 오렌지주스, 사과주스, 포도주스, 콜드프레스주스, 레모네이드
- **기타 음료**: 핫초콜릿, 말차라떼, 스무디, 에이드, 밀크셰이크, 아이스티

**OCR 오류 수정 및 예측 규칙:**
- "LTTE" → "라떼"
- "AMERICANO" → "아메리카노" 
- "ESPRESSO" → "에스프레소"
- "CAPPUCCINO" → "카푸치노"
- "MACCHIATO" → "마끼아또"
- "COLD BREW" → "콜드브루"
- "HOT TEA" → "홍차"
- "GREEN TEA" → "녹차"
- "ORANGE JUICE" → "오렌지주스"
- "COLD PRESSED JUICE" → "콜드프레스주스"
- "MATCHA LEMONADE" → "말차레모네이드"
- "RALPH'S ROAST" → "랄프스로스트커피"
- "MOCIL" → "모카"
- "LATTE_NO" → "라떼"

**응답 형식 (반드시 지켜주세요):**
["메뉴명1", "메뉴명2", "메뉴명3"]

**주의사항:**
1. 반드시 JSON 배열 형태로 응답
2. 음료 메뉴명만 추출 (가격, 설명, 기타 정보 제외)
3. 한글로 응답
4. 최대 15개까지 추출
5. OCR 오류가 있는 경우 올바른 메뉴명으로 수정
6. **확실하지 않은 메뉴도 포함** - 애매한 텍스트를 기반으로 예측
7. **모든 음료 메뉴를 놓치지 마세요** - OCR에서 추출된 텍스트에 있는 모든 음료 관련 단어를 포함

**예시 응답:**
["아메리카노", "카페라떼", "카푸치노", "에스프레소", "콜드브루", "오렌지주스", "핫초콜릿", "말차라떼"]
      `;
      
      const geminiResponse = await axios.post(geminiEnhanceUrl, {
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
    const detailedAnalysis = await processAnalysisResult(finalResult, allergyNames, userId, req.file.path, req.file.originalname, req.file.size);
    
    // 이미지 파일은 보존 (삭제하지 않음)
    // fs.unlinkSync(req.file.path); // 이 줄을 주석 처리

    res.json({
      success: true,
      message: '분석이 완료되었습니다!',
      analysis: detailedAnalysis
    });

  } catch (error) {
    console.error('메뉴 분석 오류:', error);
    
    // 에러 발생 시에만 임시 파일 정리
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
async function processAnalysisResult(aiResult, userAllergies, userId, imageUrl, originalFilename, fileSize) {
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
      originalFilename: originalFilename, // 원본 파일명 저장
      fileSize: fileSize, // 파일 크기 저장
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
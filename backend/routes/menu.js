const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MenuAnalysis, UserAllergy } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 메뉴 이미지 업로드 및 분석
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일을 업로드해주세요.'
      });
    }

    const userId = req.user.id;
    const imageUrl = `/uploads/${req.file.filename}`;

    // AI 서버로 이미지 전송하여 분석
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const aiResponse = await fetch('http://localhost:8000/menu/analyze', {
      method: 'POST',
      body: formData
    });

    let analysisResult = null;
    if (aiResponse.ok) {
      analysisResult = await aiResponse.json();
    }

    // 사용자 알레르기 정보 조회
    const userAllergies = await UserAllergy.findAll({
      where: { userId },
      attributes: ['allergyName', 'severity']
    });

    // 분석 결과에 알레르기 정보 추가
    if (analysisResult && userAllergies.length > 0) {
      const allergyNames = userAllergies.map(a => a.allergyName);
      analysisResult.userAllergies = allergyNames;
      analysisResult.allergyWarnings = analysisResult.menu_items?.filter(item => 
        item.ingredients?.some(ingredient => 
          allergyNames.includes(ingredient)
        )
      ) || [];
    }

    // 데이터베이스에 분석 결과 저장
    const menuAnalysis = await MenuAnalysis.create({
      userId,
      imageUrl,
      extractedText: analysisResult?.extracted_text || null,
      translatedText: analysisResult?.translated_text || null,
      analysisResult: analysisResult || null
    });

    res.json({
      success: true,
      message: '메뉴 분석이 완료되었습니다.',
      data: {
        analysisId: menuAnalysis.id,
        imageUrl,
        analysis: analysisResult
      }
    });

  } catch (error) {
    console.error('메뉴 업로드 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자의 분석 결과 목록 조회
router.get('/analyses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const analyses = await MenuAnalysis.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'imageUrl', 'createdAt', 'analysisResult']
    });

    res.json({
      success: true,
      data: {
        analyses: analyses.map(analysis => ({
          id: analysis.id,
          imageUrl: analysis.imageUrl,
          createdAt: analysis.createdAt,
          analysis: analysis.analysisResult
        }))
      }
    });

  } catch (error) {
    console.error('분석 결과 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 분석 결과 조회
router.get('/analyses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await MenuAnalysis.findOne({
      where: { id, userId }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: '분석 결과를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        analysis: {
          id: analysis.id,
          imageUrl: analysis.imageUrl,
          extractedText: analysis.extractedText,
          translatedText: analysis.translatedText,
          analysisResult: analysis.analysisResult,
          createdAt: analysis.createdAt
        }
      }
    });

  } catch (error) {
    console.error('분석 결과 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 
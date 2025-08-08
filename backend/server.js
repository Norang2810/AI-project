const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// dotenv가 설치되어 있지 않을 수 있으므로 try-catch로 처리
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, using default values');
}

// 데이터베이스 및 모델 import
const { sequelize } = require('./config/database');
const { User, UserAllergy, MenuAnalysis } = require('./models');

// 라우터 import
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const menuRoutes = require('./routes/menu');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy 설정 (rate-limit 오류 해결)
app.set('trust proxy', 1);

// 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // 허용할 도메인 목록
    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.1.96:3000',
      'http://localhost:80',
      'http://192.168.1.96:80'
    ];
    
    // origin이 없거나 허용된 도메인인 경우
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // IP당 최대 요청 수
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 데이터베이스 연결 및 테이블 생성
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 데이터베이스 연결 성공');
    
    // 테이블 생성 (개발 환경에서만)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ 데이터베이스 테이블 생성 완료');
    }
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    console.log('⚠️ 데이터베이스 없이 서버를 시작합니다.');
  }
};

// 라우터 설정
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/menu', menuRoutes);

// 기본 라우트
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '백엔드 서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString(),
    database: 'MySQL (테이블 생성됨)',
    apis: [
      'POST /api/auth/register - 회원가입',
      'POST /api/auth/login - 로그인',
      'POST /api/user/allergies - 알레르기 정보 저장',
      'GET /api/user/allergies - 알레르기 정보 조회',
      'POST /api/menu/upload - 메뉴 이미지 업로드',
      'GET /api/menu/analyses - 분석 결과 목록'
    ]
  });
});

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: { 
      code: 'NOT_FOUND', 
      message: 'Route not found' 
    } 
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: { 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'Something went wrong!' 
    } 
  });
});

// 서버 시작
const startServer = async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.log('⚠️ 데이터베이스 초기화 실패, 서버는 계속 실행됩니다.');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📊 서버 상태: http://localhost:${PORT}/api/health`);
    console.log(`🔐 인증 API: http://localhost:${PORT}/api/auth`);
    console.log(`👤 사용자 API: http://localhost:${PORT}/api/user`);
    console.log(`🍽️ 메뉴 API: http://localhost:${PORT}/api/menu`);
  });
};

startServer(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');

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
const geminiRoutes = require('./routes/gemini');

const app = express();
const PORT = process.env.PORT || 3001;

// 환경변수 로그 출력
console.log('🔍 환경변수 확인:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
console.log('  - DB_HOST:', process.env.DB_HOST);
console.log('  - AI_SERVER_URL:', process.env.AI_SERVER_URL);
console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '설정됨' : '설정되지 않음');

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
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // IP당 최대 요청 수
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// 정적 파일 서빙 (업로드된 이미지) - CORS 헤더 강화
app.use('/uploads', (req, res, next) => {
  // CORS 헤더 설정 - 더 강력하게
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    // 정적 파일에 대한 추가 헤더 설정
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }
}));

// 데이터베이스 연결 및 테이블 생성
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 데이터베이스 연결 성공');
    
    // 테이블 생성 (개발 환경에서만)
    if (process.env.NODE_ENV !== 'production') {
      // alter: true로 설정하여 누락된 컬럼들을 자동으로 추가
      await sequelize.sync({ force: false, alter: true });
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
app.use('/api/gemini', geminiRoutes);

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
const { Sequelize } = require('sequelize');

// 환경 변수에서 데이터베이스 설정 가져오기
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

// 필수 환경변수 검증
if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error('필수 데이터베이스 환경변수가 설정되지 않았습니다. (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)');
}

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ MySQL 데이터베이스 연결 실패:', error);
    return false;
  }
};

// 데이터베이스 동기화 (테이블 생성)
const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ 데이터베이스 테이블 동기화 완료');
    }
  } catch (error) {
    console.error('❌ 데이터베이스 동기화 실패:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
}; 
const { sequelize } = require('./config/database');
const User = require('./models/User');
const MenuAnalysis = require('./models/MenuAnalysis');
const UserAllergy = require('./models/UserAllergy');

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 데이터베이스 연결 성공');
    
    // 기존 menu_analyses 테이블의 잘못된 데이터 정리
    console.log('🧹 기존 데이터 정리 중...');
    
    // menu_analyses 테이블에서 user_id가 users 테이블에 존재하지 않는 데이터 삭제
    await sequelize.query(`
      DELETE ma FROM menu_analyses ma 
      LEFT JOIN users u ON ma.user_id = u.id 
      WHERE u.id IS NULL
    `);
    
    console.log('✅ 잘못된 데이터 정리 완료');
    
    // 테이블 동기화 (외래키 제약조건 포함)
    await sequelize.sync({ alter: true });
    console.log('✅ 데이터베이스 테이블 동기화 완료');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    process.exit(1);
  }
};

initializeDatabase();

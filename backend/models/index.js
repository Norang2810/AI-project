const { sequelize } = require('../config/database');

// 모델 정의
const User = require('./User')(sequelize);
const UserAllergy = require('./UserAllergy')(sequelize);
const MenuAnalysis = require('./MenuAnalysis')(sequelize);

// 관계 설정
User.hasMany(UserAllergy, {
  foreignKey: 'userId',
  as: 'allergies',
});

User.hasMany(MenuAnalysis, {
  foreignKey: 'userId',
  as: 'menuAnalyses',
});

// 모델들을 exports
module.exports = {
  sequelize,
  User,
  UserAllergy,
  MenuAnalysis,
}; 
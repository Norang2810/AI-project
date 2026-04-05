const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const UserAllergy = require('./UserAllergy')(sequelize);
const MenuAnalysis = require('./MenuAnalysis')(sequelize);
const AllergenCatalog = require('./AllergenCatalog')(sequelize);
const UserAllergenItem = require('./UserAllergenItem')(sequelize);
const AnalysisJob = require('./AnalysisJob')(sequelize);
const AnalysisResult = require('./AnalysisResult')(sequelize);
const MenuItem = require('./MenuItem')(sequelize);
const MenuIngredient = require('./MenuIngredient')(sequelize);

User.hasMany(UserAllergy, {
  foreignKey: 'userId',
  as: 'allergies',
});

User.hasMany(MenuAnalysis, {
  foreignKey: 'userId',
  as: 'menuAnalyses',
});

User.hasMany(UserAllergenItem, {
  foreignKey: 'userId',
  as: 'allergenItems',
});

User.hasMany(AnalysisJob, {
  foreignKey: 'userId',
  as: 'analysisJobs',
});

UserAllergy.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

MenuAnalysis.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

UserAllergenItem.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

UserAllergenItem.belongsTo(AllergenCatalog, {
  foreignKey: 'allergenCatalogId',
  as: 'allergenCatalog',
});

AllergenCatalog.hasMany(UserAllergenItem, {
  foreignKey: 'allergenCatalogId',
  as: 'userAllergenItems',
});

AllergenCatalog.hasMany(MenuIngredient, {
  foreignKey: 'allergenCatalogId',
  as: 'menuIngredients',
});

AnalysisJob.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

AnalysisJob.hasOne(AnalysisResult, {
  foreignKey: 'analysisJobId',
  as: 'analysisResult',
});

AnalysisResult.belongsTo(AnalysisJob, {
  foreignKey: 'analysisJobId',
  as: 'analysisJob',
});

AnalysisResult.hasMany(MenuItem, {
  foreignKey: 'analysisResultId',
  as: 'menuItems',
});

MenuItem.belongsTo(AnalysisResult, {
  foreignKey: 'analysisResultId',
  as: 'analysisResult',
});

MenuItem.hasMany(MenuIngredient, {
  foreignKey: 'menuItemId',
  as: 'ingredients',
});

MenuIngredient.belongsTo(MenuItem, {
  foreignKey: 'menuItemId',
  as: 'menuItem',
});

MenuIngredient.belongsTo(AllergenCatalog, {
  foreignKey: 'allergenCatalogId',
  as: 'allergenCatalog',
});

module.exports = {
  sequelize,
  User,
  UserAllergy,
  MenuAnalysis,
  AllergenCatalog,
  UserAllergenItem,
  AnalysisJob,
  AnalysisResult,
  MenuItem,
  MenuIngredient,
};

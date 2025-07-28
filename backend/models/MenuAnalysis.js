const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuAnalysis = sequelize.define('MenuAnalysis', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'image_url',
    },
    extractedText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'extracted_text',
    },
    translatedText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'translated_text',
    },
    analysisResult: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'analysis_result',
    },
  }, {
    tableName: 'menu_analyses',
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  });

  // 관계 설정
  MenuAnalysis.associate = (models) => {
    MenuAnalysis.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return MenuAnalysis;
}; 
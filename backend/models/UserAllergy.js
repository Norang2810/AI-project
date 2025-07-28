const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAllergy = sequelize.define('UserAllergy', {
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
    allergyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'allergy_name',
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
  }, {
    tableName: 'user_allergies',
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  });

  // 관계 설정
  UserAllergy.associate = (models) => {
    UserAllergy.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return UserAllergy;
}; 
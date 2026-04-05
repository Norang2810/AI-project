const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuItem = sequelize.define(
    'MenuItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      analysisResultId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'analysis_result_id',
        references: {
          model: 'analysis_results',
          key: 'id',
        },
      },
      sourceType: {
        type: DataTypes.ENUM('classification', 'similarity', 'recommendation'),
        allowNull: false,
        field: 'source_type',
      },
      itemRole: {
        type: DataTypes.ENUM('primary', 'similar', 'alternative'),
        allowNull: false,
        field: 'item_role',
      },
      displayName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'display_name',
      },
      normalizedName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'normalized_name',
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      confidence: {
        type: DataTypes.DECIMAL(6, 4),
        allowNull: true,
      },
      similarityScore: {
        type: DataTypes.DECIMAL(8, 5),
        allowNull: true,
        field: 'similarity_score',
      },
      safetyScore: {
        type: DataTypes.DECIMAL(8, 5),
        allowNull: true,
        field: 'safety_score',
      },
      riskLevel: {
        type: DataTypes.ENUM('safe', 'low_risk', 'high_risk', 'dangerous', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown',
        field: 'risk_level',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: 'menu_items',
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['analysis_result_id', 'item_role'],
          name: 'menu_items_analysis_result_id_item_role_idx',
        },
        {
          fields: ['normalized_name'],
          name: 'menu_items_normalized_name_idx',
        },
        {
          fields: ['risk_level'],
          name: 'menu_items_risk_level_idx',
        },
      ],
    }
  );

  return MenuItem;
};

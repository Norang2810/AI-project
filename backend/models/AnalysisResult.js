const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AnalysisResult = sequelize.define(
    'AnalysisResult',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      analysisJobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'analysis_results_analysis_job_id_unique',
        field: 'analysis_job_id',
        references: {
          model: 'analysis_jobs',
          key: 'id',
        },
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
      enhancedText: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'enhanced_text',
      },
      rawAiResponse: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'raw_ai_response',
      },
      menuClassification: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'menu_classification',
      },
      ingredientAnalysis: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'ingredient_analysis',
      },
      allergyRisk: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'allergy_risk',
      },
      recommendations: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      similarMenus: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'similar_menus',
      },
    },
    {
      tableName: 'analysis_results',
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['analysis_job_id'],
          name: 'analysis_results_analysis_job_id_unique',
        },
      ],
    }
  );

  return AnalysisResult;
};

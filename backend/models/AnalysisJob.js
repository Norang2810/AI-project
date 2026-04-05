const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AnalysisJob = sequelize.define(
    'AnalysisJob',
    {
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
      status: {
        type: DataTypes.ENUM('queued', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'completed',
      },
      sourceImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'source_image_url',
      },
      originalFilename: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'original_filename',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'file_size',
      },
      requestLatencyMs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'request_latency_ms',
      },
      aiLatencyMs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ai_latency_ms',
      },
      geminiLatencyMs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'gemini_latency_ms',
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_message',
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'started_at',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at',
      },
      pipelineVersion: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'menu-analyze-v2',
        field: 'pipeline_version',
      },
    },
    {
      tableName: 'analysis_jobs',
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['user_id', 'created_at'],
          name: 'analysis_jobs_user_id_created_at_idx',
        },
        {
          fields: ['status', 'created_at'],
          name: 'analysis_jobs_status_created_at_idx',
        },
        {
          fields: ['pipeline_version'],
          name: 'analysis_jobs_pipeline_version_idx',
        },
      ],
    }
  );

  return AnalysisJob;
};

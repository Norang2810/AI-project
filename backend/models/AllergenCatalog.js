const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AllergenCatalog = sequelize.define(
    'AllergenCatalog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      displayName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'display_name',
      },
      normalizedName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: 'allergen_catalog_normalized_name_unique',
        field: 'normalized_name',
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      tableName: 'allergen_catalog',
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['normalized_name'],
          name: 'allergen_catalog_normalized_name_unique',
        },
        {
          fields: ['is_active'],
          name: 'allergen_catalog_is_active_idx',
        },
      ],
    }
  );

  return AllergenCatalog;
};

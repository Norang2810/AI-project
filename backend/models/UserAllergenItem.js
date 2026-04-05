const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAllergenItem = sequelize.define(
    'UserAllergenItem',
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
      allergenCatalogId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'allergen_catalog_id',
        references: {
          model: 'allergen_catalog',
          key: 'id',
        },
      },
      allergenName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'allergen_name',
      },
      normalizedName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'normalized_name',
      },
      severity: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      source: {
        type: DataTypes.ENUM('catalog', 'custom', 'legacy'),
        allowNull: false,
        defaultValue: 'catalog',
      },
    },
    {
      tableName: 'user_allergen_items',
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'normalized_name'],
          name: 'user_allergen_items_user_id_normalized_name_unique',
        },
        {
          fields: ['user_id', 'severity'],
          name: 'user_allergen_items_user_id_severity_idx',
        },
        {
          fields: ['allergen_catalog_id'],
          name: 'user_allergen_items_allergen_catalog_id_idx',
        },
      ],
    }
  );

  return UserAllergenItem;
};

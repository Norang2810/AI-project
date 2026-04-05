const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuIngredient = sequelize.define(
    'MenuIngredient',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      menuItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'menu_item_id',
        references: {
          model: 'menu_items',
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
      ingredientName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'ingredient_name',
      },
      normalizedName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'normalized_name',
      },
      sourceType: {
        type: DataTypes.ENUM('analysis', 'dataset'),
        allowNull: false,
        defaultValue: 'analysis',
        field: 'source_type',
      },
      riskLevel: {
        type: DataTypes.ENUM('safe', 'warning', 'danger', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown',
        field: 'risk_level',
      },
      matchedAllergenName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'matched_allergen_name',
      },
      isUserAllergen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_user_allergen',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: 'menu_ingredients',
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['menu_item_id'],
          name: 'menu_ingredients_menu_item_id_idx',
        },
        {
          fields: ['allergen_catalog_id'],
          name: 'menu_ingredients_allergen_catalog_id_idx',
        },
        {
          fields: ['normalized_name'],
          name: 'menu_ingredients_normalized_name_idx',
        },
        {
          fields: ['is_user_allergen', 'risk_level'],
          name: 'menu_ingredients_user_allergen_risk_idx',
        },
      ],
    }
  );

  return MenuIngredient;
};

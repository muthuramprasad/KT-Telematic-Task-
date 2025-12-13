module.exports = (sequelize, DataTypes) => {
  const AssetCategory = sequelize.define(
    "AssetCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "asset_categories",
    }
  );

  return AssetCategory;
};

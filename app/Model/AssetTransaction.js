module.exports = (sequelize, DataTypes) => {
  const AssetTransaction = sequelize.define(
    "AssetTransaction",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      assetID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employeeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("ISSUE", "RETURN", "SCRAP"),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: "Asset_Transaction",
    }
  );
  return AssetTransaction;
};

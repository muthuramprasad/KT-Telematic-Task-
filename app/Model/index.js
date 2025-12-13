// (async()=>{
  
//     try{
//         await sequelize.authenticate();
//         console.log('Database Connected Succesfully')
//     }
//     catch(err){
//         console.error('Unable To connect to Databse',err)
//     }



// })()


const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;   


db.Employee = require('./Employee')(sequelize, DataTypes);
db.AssetCategory = require('./AssetCategory.model')(sequelize, DataTypes);
db.Asset = require('./Asset')(sequelize, DataTypes);
db.AssetTransaction = require('./AssetTransaction')(sequelize, DataTypes);


db.AssetCategory.hasMany(db.Asset, {
  foreignKey: 'categoryId',
  as: 'assets'
});
db.Asset.belongsTo(db.AssetCategory, {
  foreignKey: 'categoryId',
  as: 'category'
});


db.Employee.hasMany(db.Asset, {
  foreignKey: 'currentEmployeeId',
  as: 'currentAssets'
});
db.Asset.belongsTo(db.Employee, {
  foreignKey: 'currentEmployeeId',
  as: 'currentHolder'
});


db.Asset.hasMany(db.AssetTransaction, {
  foreignKey: 'assetID',
  as: 'history'
});
db.AssetTransaction.belongsTo(db.Asset, {
  foreignKey: 'assetID',
  as: 'asset'
});

// Employee → Transactions
db.Employee.hasMany(db.AssetTransaction, {
  foreignKey: 'employeeID',
  as: 'transactions'
});
db.AssetTransaction.belongsTo(db.Employee, {
  foreignKey: 'employeeID',
  as: 'employee'
});

module.exports = db;

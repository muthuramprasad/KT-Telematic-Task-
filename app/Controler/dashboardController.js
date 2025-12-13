
const db = require("../Model");
const AssetModel = db.Asset;
const EmployeeModel = db.Employee;
const AssetCategoryModel = db.AssetCategory;
const { Op } = db.Sequelize;


exports.viewDashboard = async (req, res) => {
  try {
  
    const totalAssets = await AssetModel.count(); 


    const assetsInStock = await AssetModel.count({ where: { status: 'IN_STOCK' } }); 
    const assetsIssued = await AssetModel.count({ where: { status: 'ISSUED' } });
    const totalEmployees = await EmployeeModel.count();

const stockByCategory = await AssetModel.findAll({
      attributes: [
 
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Asset.unique_id')), 'stockCount']
      ],
      where: { status: 'IN_STOCK' },
      include: [
        { model: AssetCategoryModel, as: 'category', attributes: ['name'] }
      ],
      group: ['Asset.categoryId', 'category.id', 'category.name'],
   
      order: [
          ['stockCount', 'DESC'] 
      ],
      raw: true
    });

    res.render("dashboard", {
      title: "Asset Tracker Dashboard",
      totalAssets,
      assetsInStock,
      assetsIssued,
      totalEmployees,
      stockByCategory,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Server Error");
  }
};
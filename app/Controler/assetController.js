const db = require("../Model");
const AssetModel = db.Asset;
const AssetCategoryModel = db.AssetCategory;
const EmployeeModel = db.Employee;
const { Op } = db.Sequelize;


exports.viewAllAssets = async (req, res) => {
  try {
    let {
      search = "", 
      status = "", 
      category = "", 
      page = 1,
      itemPerPage = 10,
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limit = parseInt(itemPerPage, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    let filter = {};
    let includeConditions = [
      { model: AssetCategoryModel, as: 'category', attributes: ['name'] },
   { 
  model: EmployeeModel, 
  as: 'currentHolder', 
  attributes: ['firstname'], 
  required: false 
}
    ];

    if (search) {
    
      filter[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.categoryId = category;
    }

    
    const categories = await AssetCategoryModel.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });


    const { rows: assets, count: totalAssets } =
      await AssetModel.findAndCountAll({
        where: filter,
        include: includeConditions,
        limit,
        offset,
        order: [["id", "ASC"]],
      });

    const totalPages = Math.ceil(totalAssets / limit);

    if (assets.length === 0 && totalAssets > 0 && pageNumber !== 1) {
      return res.redirect(`/api/assets/view?page=1&itemPerPage=${limit}`);
    }

    res.render("assets/list", {
      title: "Asset Master List",
      assets,
      categories, 
      search,
      status,
      category: category, 
      page: pageNumber,
      itemPerPage: limit,
      totalPages,
      assetStatuses: AssetModel.getAttributes().status.values, 
    });

  } catch (err) {
    console.error("Fetching assets error:", err);
    res.status(500).send("Server Error");
  }
};



exports.showAddForm = async (req, res) => {
  try {
    const categories = await AssetCategoryModel.findAll({
      order: [['name', 'DESC']]
    });

    if (categories.length === 0) {
      return res.status(400).send("Cannot add asset. Please create an Asset Category first.");
    }

    const employees = await EmployeeModel.findAll({
      where: { status: 'active' }, 
      order: [['firstname', 'ASC']]
    });

    const assetStatuses = AssetModel.getAttributes().status.values;

    res.render("assets/form", {
      title: "Add New Asset",
      categories,
      employees,
      assetStatuses,
    });
  } catch (err) {
    console.error("Error showing add form:", err);
    res.status(500).send("Server Error");
  }
};



exports.createAsset = async (req, res) => {

console.log('create Asset Data',req.body)

  const { name, serialNumber, categoryId ,currentEmployeeId, status} = req.body;

  try {
    if (!name || !serialNumber || !categoryId || !currentEmployeeId || ! status) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: [
          !name && { field: "name", message: "Asset name/model is required." },
          !serialNumber && { field: "serialNumber", message: "Serial Number is required." },
          !categoryId && { field: "categoryId", message: "Asset Category is required." },
          ! status && { field: "status", message: "Asset  status is required." },
        
        ].filter(Boolean),
      });
    }

 
    const existingAsset = await AssetModel.findOne({
      where: { serialNumber }
    });

    if (existingAsset) {
      return res.status(409).send(`Asset with serial number ${serialNumber} already exists.`);
    }

  await AssetModel.create({ 
        name, 
        serialNumber, 
        categoryId, 
        currentEmployeeId: currentEmployeeId || null,
         status: status
     
    });

    res.redirect('/api/assets/view');
  } catch (err) {
    console.error("Error creating asset:", err);
    res.status(500).send("Server Error");
  }
};


exports.showEditForm = async (req, res) => {
  const { id } = req.params;

  try {
    const asset = await AssetModel.findByPk(id);

    if (!asset) return res.status(404).send("Asset not found");

    const categories = await AssetCategoryModel.findAll({
      order: [['name', 'ASC']]
    });
    
    const employees = await EmployeeModel.findAll({
      order: [['firstname', 'ASC']]
    });

  

    res.render("assets/form", {
      title: "Edit Asset",
      asset,
      categories,
      employees, 
      isEdit: true,
     
      assetStatuses: AssetModel.getAttributes().status.values,
    });
  } catch (err) {
    console.error("Error showing edit form:", err);
    res.status(500).send("Server Error");
  }
};



exports.updateAsset = async (req, res) => {
  const { id } = req.params;
const { name, serialNumber, categoryId, status, currentEmployeeId } = req.body;




  let newCurrentEmployeeId = currentEmployeeId || null;
  let newStatus = status;


  try {
    if (!name || !serialNumber || !categoryId || !status) {
      return res.status(400).send("Validation Failed: All fields are required.");
    }
    
    const existingAsset = await AssetModel.findOne({
      where: { 
        serialNumber, 
        id: { [Op.not]: id } 
      }
    });

    if (existingAsset) {
      return res.status(409).send(`Asset with serial number ${serialNumber} already exists.`);
    }

 

    await AssetModel.update(
      { 
        name, 
        serialNumber, 
        categoryId, 
        status: newStatus,
        currentEmployeeId: newCurrentEmployeeId 
      },
      { where: { id } }
    );
    res.redirect("/api/assets/view");
  } catch (err) {
    console.error("Update asset error:", err);
    res.status(500).send("Server Error");
  }
};


exports.deleteAsset = async (req, res) => {
  const { id } = req.params;
  let { page = 1, itemPerPage = 10, search = "", status = "", category = "" } = req.query;

  page = parseInt(page, 10);
  itemPerPage = parseInt(itemPerPage, 10);

  try {

    await AssetModel.destroy({ where: { id } });

    let filter = {};
    if (search) {
      filter[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.categoryId = category;
    }

    const remainingCount = await AssetModel.count({
      where: filter,
    });

    const totalPages = Math.ceil(remainingCount / itemPerPage);

    if (page > totalPages && totalPages > 0) {
      page = totalPages; 
    }

    res.redirect(
      `/api/assets/view?page=${page}&itemPerPage=${itemPerPage}&search=${search || ''}&status=${status || ''}&category=${category || ''}`
    );

  } catch (err) {
    console.error("Delete asset error:", err);
    res.status(500).send("Server Error");
  }
};
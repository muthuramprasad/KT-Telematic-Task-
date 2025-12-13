const db = require("../Model");
const AssetTransactionModel = db.AssetTransaction;
const AssetModel = db.Asset;
const EmployeeModel = db.Employee;
const { Op } = db.Sequelize;

const getIssuePrerequisites = async () => {
  const availableAssets = await AssetModel.findAll({
    where: { status: 'IN_STOCK' },
    include: [{ model: db.AssetCategory, as: 'category', attributes: ['name'] }],
    order: [['name', 'ASC']]
  });

  const activeEmployees = await EmployeeModel.findAll({
    where: { status: 'active' },
    order: [['firstname', 'ASC']]
  });

  return { availableAssets, activeEmployees };
};

const getReturnPrerequisites = async () => {
  const issuedAssets = await AssetModel.findAll({
    where: { status: 'ISSUED' },
    include: [
      { model: EmployeeModel, as: 'currentHolder', attributes: ['firstname', 'department'] },
      { model: db.AssetCategory, as: 'category', attributes: ['name'] }
    ],
    order: [['name', 'ASC']]
  });

  return { issuedAssets };
};

const getScrapPrerequisites = async () => {
    const scrappableAssets = await AssetModel.findAll({
        where: { 
            status: { [Op.notIn]: ['SCRAPPED'] } 
        },
        include: [
            { model: EmployeeModel, as: 'currentHolder', attributes: ['firstname', 'department'], required: false },
            { model: db.AssetCategory, as: 'category', attributes: ['name'] }
        ],
        order: [['name', 'ASC']]
    });

    return { scrappableAssets };
};


exports.showIssueForm = async (req, res) => {
  try {
    const { availableAssets, activeEmployees } = await getIssuePrerequisites();

    res.render("transactions/issueForm", {
      title: "Issue Asset to Employee",
      availableAssets,
      activeEmployees,
    });
  } catch (err) {
    console.error("Error showing issue form:", err);
    res.status(500).send("Server Error");
  }
};

exports.issueAsset = async (req, res) => {
  const { assetID, employeeID } = req.body;

  try {
    if (!assetID || !employeeID) {
      return res.status(400).send("Asset and Employee must be selected.");
    }

   
    const asset = await AssetModel.findByPk(assetID);
    if (!asset || asset.status !== 'IN_STOCK') {
      return res.status(400).send("Asset is not available for issue.");
    }

    await AssetModel.update(
      { status: 'ISSUED', currentEmployeeId: employeeID },
      { where: { id: assetID } }
    );

    await AssetTransactionModel.create({
      assetID,
      employeeID,
      type: 'ISSUE',
    });

    res.redirect('/api/assets/view');
  } catch (err) {
    console.error("Error issuing asset:", err);
    res.status(500).send("Server Error");
  }
};



exports.showReturnForm = async (req, res) => {
  try {
    const { issuedAssets } = await getReturnPrerequisites();

    res.render("transactions/returnForm", {
      title: "Return Asset from Employee",
      issuedAssets,
    });
  } catch (err) {
    console.error("Error showing return form:", err);
    res.status(500).send("Server Error");
  }
};

exports.returnAsset = async (req, res) => {
  const { assetID, reason = 'N/A' } = req.body; 

  try {
    if (!assetID) {
      return res.status(400).send("Asset must be selected for return.");
    }

 
    const asset = await AssetModel.findByPk(assetID);
    if (!asset || asset.status !== 'ISSUED') {
      return res.status(400).send("Asset is not currently issued.");
    }
    const currentEmployeeId = asset.currentEmployeeId;
    
 
    await AssetModel.update(
      { status: 'IN_STOCK', currentEmployeeId: null },
      { where: { id: assetID } }
    );

    await AssetTransactionModel.create({
      assetID,
      employeeID: currentEmployeeId, 
      type: 'RETURN',
   
    });

    res.redirect('/api/assets/view');
  } catch (err) {
    console.error("Error returning asset:", err);
    res.status(500).send("Server Error");
  }
};



exports.showScrapForm = async (req, res) => {
    try {
        const { scrappableAssets } = await getScrapPrerequisites();
        
        res.render("transactions/scrapForm", {
            title: "Scrap Asset (Mark as Obsolete)",
            scrappableAssets,
        });
    } catch (err) {
        console.error("Error showing scrap form:", err);
        res.status(500).send("Server Error");
    }
};

exports.scrapAsset = async (req, res) => {
  const { assetID, reason = 'Obsolete' } = req.body;

  try {
    if (!assetID) {
      return res.status(400).send("Asset must be selected for scrapping.");
    }

    const asset = await AssetModel.findByPk(assetID);
    if (!asset || asset.status === 'SCRAPPED') {
      return res.status(400).send("Asset is already scrapped or not found.");
    }
    const currentEmployeeId = asset.currentEmployeeId;

  
    await AssetModel.update(
      { status: 'SCRAPPED', currentEmployeeId: null },
      { where: { id: assetID } }
    );

 
    await AssetTransactionModel.create({
      assetID,
      employeeID: currentEmployeeId,
      type: 'SCRAP',
 
    });

    res.redirect('/api/assets/view');
  } catch (err) {
    console.error("Error scrapping asset:", err);
    res.status(500).send("Server Error");
  }
};



exports.viewAssetHistory = async (req, res) => {
  try {
    const assets = await AssetModel.findAll({ 
        attributes: ['id', 'name', 'serialNumber'],
        order: [['name', 'ASC']] 
    });
    
    const { assetID } = req.query;
    let history = [];
    let selectedAsset = null;

    if (assetID) {
      selectedAsset = await AssetModel.findByPk(assetID, {
        include: [{ model: db.AssetCategory, as: 'category' }]
      });

      history = await AssetTransactionModel.findAll({
        where: { assetID },
        include: [
          { model: db.Asset, as: 'asset', attributes: ['name', 'serialNumber'] },
          { model: db.Employee, as: 'employee', attributes: ['firstname', 'department'] }
        ],
        order: [['date', 'DESC']],
      });
    }

    res.render("transactions/history", {
      title: "Asset Transaction History",
      assets,
      history,
      selectedAsset,
      assetID: parseInt(assetID),
    });

  } catch (err) {
    console.error("Error fetching asset history:", err);
    res.status(500).send("Server Error");
  }
};
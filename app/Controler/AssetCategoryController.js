const db = require("../Model");
const AssetCategoryModel = db.AssetCategory;
const { Op } = db.Sequelize;


exports.viewAllCategories = async (req, res) => {
  try {
    let {
      search = "",
      page = 1,         
      itemPerPage = 10,  
    } = req.query;
    
    const pageNumber = parseInt(page, 10) || 1;
    const limit = parseInt(itemPerPage, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    let filter = {};
    if (search) {
      filter.name = { [Op.iLike]: `%${search}%` };
    }

    const { rows: categories, count: totalCategories } =
      await AssetCategoryModel.findAndCountAll({
        where: filter,
        limit, 
        offset, 
        order: [["name", "DESC"]],
      });
      
    const totalPages = Math.ceil(totalCategories / limit);

    if (categories.length === 0 && totalCategories > 0 && pageNumber !== 1) {
      return res.redirect(`/api/categories/view?page=1&itemPerPage=${limit}`);
    }

    res.render("categories/list", {
      title: "Asset Categories",
      categories,
      search,
    
      page: pageNumber,
      itemPerPage: limit,
      totalPages,
    });
  } catch (err) {
    console.error("Fetching categories error:", err);
    res.status(500).send("Server Error");
  }
};



exports.showAddForm = async (req, res) => {
  res.render("categories/form", {
    title: "Add New Category",
  });
};



exports.createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).send("Category name is required.");
    }

    const existingCategory = await AssetCategoryModel.findOne({
      where: { name: { [Op.iLike]: name } }
    });

    if (existingCategory) {
      return res.status(409).send(`Category '${name}' already exists.`);
    }

    await AssetCategoryModel.create({ name, description });

    res.redirect('/api/categories/view'                    
  );
  } catch (err) {
    console.error("Error creating category:"                    
  , err);
    res.status(500).send("Server Error"                    
  );
  }
};


  
exports.showEditForm = async (req, res) => {
  const { id } = req.params;

  const category = await AssetCategoryModel.findByPk(id);

  if (!category) return res.status(404).send("Category not found");

  res.render("categories/form", {
    title: "Edit Category",
    category,
    isEdit: true,
  });
};


exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).send("Category name is required.");
    }
    
    const existingCategory = await AssetCategoryModel.findOne({
      where: { 
        name: { [Op.iLike]: name }, 
        id: { [Op.not]: id } 
      }
    });

    if (existingCategory) {
      return res.status(409).send(`Category '${name}' already exists.`);
    }

    await AssetCategoryModel.update(
      { name, description },
      { where: { id } }
    );

    res.redirect("/api/categories/view");
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).send("Server Error");
  }
};


exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  let { page = 1, itemPerPage = 10, search = ""} = req.query;

  page = parseInt(page, 10);
  itemPerPage = parseInt(itemPerPage, 10);

  try {
 

    await AssetCategoryModel.destroy({ where: { id } });


    let filter = {};
    if (search) {
      filter.firstname = { [Op.iLike]: `%${search}%` };
    }
  

    const remainingCount = await AssetCategoryModel.count({
      where: filter,
    });

    const totalPages = Math.ceil(remainingCount / itemPerPage);

   
    if (page > totalPages && totalPages > 0) {
      page = totalPages; 
    }


    res.redirect(
      `/api/categories/view?page=${page}&itemPerPage=${itemPerPage}&search=${search}`
    );
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).send("Server Error");
  }
};
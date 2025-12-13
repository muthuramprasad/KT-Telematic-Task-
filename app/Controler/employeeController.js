const db = require("../Model");
const EmployeeModel = db.Employee;
const { Op } = db.Sequelize;


exports.createEmployee = async (req, res) => {
  const { firstname, department, status } = req.body;

  try {
   
    if (!firstname || !department || !status) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: [
          !firstname && { field: "firstname", message: "First name is required." },
          !department && { field: "department", message: "Department is required." },
          !status && { field: "status", message: "Status is required." }
        ].filter(Boolean),
      });
    }

   
    const existingEmployee = await EmployeeModel.findOne({
      where: { firstname, department }
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: `Employee ${firstname} already exists in ${department}`
      });
    }

    await EmployeeModel.create({ firstname, department, status });

    res.redirect('/api/employees/view');

  } catch (err) {
    console.error("Error creating employee:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};


exports.viewAllEmployees = async (req, res) => {
  try {
 
    let {
      search = "",
      status = "",
      page = 1,
      itemPerPage = 10,
    } = req.query;

    
    const pageNumber = parseInt(page, 10) || 1;
    const limit = parseInt(itemPerPage, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    
    let whereCondition = {};

    if (search) {
      whereCondition.firstname = { [Op.iLike]: `%${search}%` };
    }

    if (status) {
      whereCondition.status = status;
    }

   
    const { rows: employees, count: totalEmployees } =
      await EmployeeModel.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["id", "DESC"]],
      });

 
    const totalPages = Math.ceil(totalEmployees / limit);

 
    if (employees.length === 0 && totalEmployees > 0 && pageNumber !== 1) {
      return res.redirect(`/api/employees/view?page=1&itemPerPage=${limit}`);
    }

  
    res.render("employees/list", {
      title: "Employee List",
      employees,
      search,
      status,
      page: pageNumber,
      itemPerPage: limit,
      totalPages,
    });

  } catch (err) {
    console.error("Fetching employees error:", err);
    res.status(500).send("Server Error");
  }
};




exports.showAddForm = async (req, res) => {
  res.render("employees/form", {
    title: "Add Employee",
  });
};


exports.showEditForm = async (req, res) => {
  const { id } = req.params;

  const employee = await EmployeeModel.findByPk(id);

  if (!employee) return res.status(404).send("Employee not found");

  res.render("employees/form", {
    title: "Edit Employee",
    employee,
    isEdit: true,
  });
};


exports.updateEmployeeForm = async (req, res) => {
  const { id } = req.params;
  const { firstname, department, status } = req.body;

  try {
    await EmployeeModel.update(
      { firstname, department, status },
      { where: { id } }
    );

    res.redirect("/api/employees/view");

  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({
      message: "Error updating employee",
      error: err.message,
    });
  }
};



exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  let { page = 1, itemPerPage = 10, search = "", status = "" } = req.query;

  page = parseInt(page, 10);
  itemPerPage = parseInt(itemPerPage, 10);

  try {
    await EmployeeModel.destroy({ where: { id } });

    
    let whereCondition = {};
    if (search) {
      whereCondition.firstname = { [Op.iLike]: `%${search}%` };
    }
    if (status) {
      whereCondition.status = status;
    }

    const remainingCount = await EmployeeModel.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(remainingCount / itemPerPage);

   
    if (page > totalPages && totalPages > 0) {
      page = totalPages; 
    }

    res.redirect(
      `/api/employees/view?page=${page}&itemPerPage=${itemPerPage}&search=${search}&status=${status}`
    );

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Server Error");
  }
};

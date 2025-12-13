module.exports = (app) => {
  const express = require("express");
  const AsyncHandler = require("express-async-handler");
  const router = express.Router();
  const EmployeeController = require("../Controler/employeeController");

  router.get("/employees/view", AsyncHandler(EmployeeController.viewAllEmployees));
  router.get("/employees/add", AsyncHandler(EmployeeController.showAddForm));
  router.get("/employees/edit/:id", AsyncHandler(EmployeeController.showEditForm));
  router.post("/employees/create", AsyncHandler(EmployeeController.createEmployee));
  router.post("/employees/update/:id", AsyncHandler(EmployeeController.updateEmployeeForm));
  router.get("/employees/delete/:id", AsyncHandler(EmployeeController.deleteEmployee));

  app.use("/api", router);
};

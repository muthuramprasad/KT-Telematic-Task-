module.exports = (app) => {
  const express = require("express");
  const AsyncHandler = require("express-async-handler");
  const router = express.Router();
  const CategoryController = require("../Controler/AssetCategoryController"); // Correct spelling of 'Controller'

  router.get("/categories/view", AsyncHandler(CategoryController.viewAllCategories));
  router.get("/categories/add", AsyncHandler(CategoryController.showAddForm));
  router.get("/categories/edit/:id", AsyncHandler(CategoryController.showEditForm));
  router.post("/categories/create", AsyncHandler(CategoryController.createCategory));
  router.post("/categories/update/:id", AsyncHandler(CategoryController.updateCategory));
  router.get("/categories/delete/:id", AsyncHandler(CategoryController.deleteCategory));

  app.use("/api", router);
};
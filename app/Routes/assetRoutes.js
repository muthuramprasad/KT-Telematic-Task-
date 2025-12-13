module.exports = (app) => {
  const express = require("express");
  const AsyncHandler = require("express-async-handler");
  const router = express.Router();
  const AssetController = require("../Controler/assetController");

  router.get("/assets/view", AsyncHandler(AssetController.viewAllAssets));
  router.get("/assets/add", AsyncHandler(AssetController.showAddForm));
  router.get("/assets/edit/:id", AsyncHandler(AssetController.showEditForm));
  router.post("/assets/create", AsyncHandler(AssetController.createAsset));
  router.post("/assets/update/:id", AsyncHandler(AssetController.updateAsset));
  router.get("/assets/delete/:id", AsyncHandler(AssetController.deleteAsset));

  app.use("/api", router);
};
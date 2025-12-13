module.exports = (app) => {
  const express = require("express");
  const AsyncHandler = require("express-async-handler");
  const router = express.Router();
  const TransactionController = require("../Controler/transactionController");


  router.get("/transactions/issue", AsyncHandler(TransactionController.showIssueForm));
  router.post("/transactions/issue", AsyncHandler(TransactionController.issueAsset));


  router.get("/transactions/return", AsyncHandler(TransactionController.showReturnForm));
  router.post("/transactions/return", AsyncHandler(TransactionController.returnAsset));


  router.get("/transactions/scrap", AsyncHandler(TransactionController.showScrapForm));
  router.post("/transactions/scrap", AsyncHandler(TransactionController.scrapAsset));
  

  router.get("/transactions/history", AsyncHandler(TransactionController.viewAssetHistory));

  app.use("/api", router);
};
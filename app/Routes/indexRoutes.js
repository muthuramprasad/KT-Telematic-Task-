
  const express = require("express");
  const AsyncHandler = require("express-async-handler");
  const router = express.Router();
  

  const DashboardController = require("../Controler/dashboardController");


  router.get("/", AsyncHandler(DashboardController.viewDashboard));

module.exports = router;
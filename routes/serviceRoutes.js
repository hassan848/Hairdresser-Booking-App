const express = require("express");
const serviceController = require("./../controllers/serviceController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.authenticate, serviceController.createService);

router
  .route("/:id")
  .patch(authController.authenticate, serviceController.editService)
  .delete(authController.authenticate, serviceController.deleteService);

module.exports = router;

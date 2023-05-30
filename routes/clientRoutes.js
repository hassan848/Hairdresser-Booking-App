const express = require("express");
const clientController = require("./../controllers/clientController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/updateAddress")
  .patch(authController.authenticate, clientController.updateClientAddress);

router
  .route("/updateProximity")
  .patch(authController.authenticate, clientController.updateProximity);

router.route("/bookmark").post(clientController.bookmarkHairdresser);

router.route("/removeBookmark").patch(clientController.removeBookmark);

module.exports = router;

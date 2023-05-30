const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.authenticate,
    authController.confineRouteTo("client"),
    reviewController.createNewReview
  );

router
  .route("/:id")
  .patch(
    authController.authenticate,
    authController.confineRouteTo("client"),
    reviewController.updateReview
  );

module.exports = router;

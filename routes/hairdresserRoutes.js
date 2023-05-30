const express = require("express");
const hairdresserController = require("./../controllers/hairdresserController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/").get(hairdresserController.getAllHairdressers);
router
  .route("/hairdressers-distance")
  .get(hairdresserController.getAllHairdressersWithDistance);

router
  .route("/SuggestedFrequent-hairdressers")
  .get(
    hairdresserController.getAll,
    hairdresserController.mostBookedHairdressers
  );

router
  .route("/hairdresser-distance")
  .get(hairdresserController.hairdresserDistance);

router
  .route("/hairdressers")
  .get(hairdresserController.getHairdressersDistances);

router
  .route("/hair")
  .get(
    hairdresserController.getAll,
    hairdresserController.getHairdressersDistances
  );

router
  .route("/updateAddress")
  .patch(authController.authenticate, hairdresserController.updateAddress);

router
  .route("/updateProximity")
  .patch(authController.authenticate, hairdresserController.updateProximity);

router
  .route("/myWorkSchedule")
  .patch(authController.authenticate, hairdresserController.editHairdresser2);

router
  .route("/:id")
  .patch(authController.authenticate, hairdresserController.editHairdresser);

module.exports = router;

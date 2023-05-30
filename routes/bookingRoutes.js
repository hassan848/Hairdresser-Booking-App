const express = require("express");
const bookingAppointController = require("./../controllers/bookingAppointController");
const authController = require("./../controllers/authController");
const pugController = require("../controllers/pugController");

const router = express.Router();

router.route("/createBooking").post(bookingAppointController.createNewBooking);
router
  .route("/checkAvailBookings")
  .get(bookingAppointController.getReleventBookings);

router.get(
  "/my-booking-history",
  authController.authenticate,
  authController.confineRouteTo("client"),
  pugController.myBookingsHistory
);

router.patch(
  "/editBooking/:id",
  authController.authenticate,
  bookingAppointController.updateBookingStatus
);

module.exports = router;

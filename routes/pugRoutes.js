const express = require("express");
const pugController = require("../controllers/pugController");
const authController = require("../controllers/authController");
const hairdresserController = require("../controllers/hairdresserController");

const router = express.Router();

// router.use(authController.isSignedIn);

router.get("/", authController.isSignedIn, pugController.getHomepage);
router.get("/login", authController.isSignedIn, pugController.loginPage);
router.get("/signup", authController.isSignedIn, pugController.signupPage);
router.get(
  "/hairdresserSignup",
  authController.isSignedIn,
  pugController.hairdresserSignup
);

router.get(
  "/findHairdressers",
  authController.isSignedIn,
  // authController.isSignedIn,
  pugController.findHairdresser
);

router.get(
  "/hairdresser/:id",
  authController.isSignedIn,
  //   authController.authenticate,
  pugController.getHairdresser
);

router.get(
  "/myServices",
  authController.authenticate,
  authController.confineRouteTo("hairdresser"),
  pugController.myServices
);

router.get("/forgotPassEmail", pugController.forgotPasswordEmail);
router.get(
  "/emailSentConfirmation/:email",
  pugController.emailSentConfirmation
);
router.get("/changePassword/:token", pugController.changePassword);

router.get(
  "/bookingReqConfirmation/:bookingId",
  authController.authenticate,
  pugController.bookingReqConf
);

router.get(
  "/my-booking-history",
  authController.authenticate,
  authController.confineRouteTo("client"),
  pugController.myBookingsHistory
);

router.get(
  "/my-appointments",
  authController.authenticate,
  authController.confineRouteTo("hairdresser"),
  pugController.myAppointments
);

router.get(
  "/myBooking/:bookingId",
  authController.authenticate,
  authController.confineRouteTo("client"),
  pugController.getBookingClients
);

router.get(
  "/myClientBooking/:bookingId",
  authController.authenticate,
  authController.confineRouteTo("hairdresser"),
  pugController.getHairdresserBooking
);

router.get(
  "/profilePage",
  authController.authenticate,
  pugController.profilePage
);

router.get(
  "/addressSettings",
  authController.authenticate,
  pugController.addressSettings
);
router.get(
  "/workSchedule",
  authController.authenticate,
  authController.confineRouteTo("hairdresser"),
  pugController.workSchedule
);

router.get(
  "/recommendedHairdressers",
  authController.authenticate,
  authController.confineRouteTo("client"),
  hairdresserController.setRecommendQuery,
  hairdresserController.getAll,
  pugController.recommendedHairdresser
);

router.get(
  "/bookmarkedHairdressers",
  authController.authenticate,
  authController.confineRouteTo("client"),
  pugController.getBookmarkedHairdressers
);

module.exports = router;

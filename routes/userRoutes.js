const express = require("express");

const authController = require("./../controllers/authController");
const userBothController = require("./../controllers/userBothController");

const router = express.Router();

// This part is used to deal with USER AUTHENTICATION or relevent for the user's themselves.
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/signout", authController.signOut);

router.post("/forgotPass", authController.forgotPassword);
router.patch("/resetPass/:resetToken", authController.resetPass);

router.patch(
  "/updateNameEmail",
  authController.authenticate,
  userBothController.updateProfileImg,
  userBothController.shrinkProfileImg,
  userBothController.updateNameEmail
);

router.patch(
  "/updateUserPassword",
  authController.authenticate,
  authController.editMyPassword
);

module.exports = router;

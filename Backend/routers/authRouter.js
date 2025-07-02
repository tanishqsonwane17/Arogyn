const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.Register);
router.post("/login", authController.Login);
router.post("/logout", authController.Logout);
router.patch("/send-verification-code", authController.sendVerificationCode);
router.patch(
  "/verify-verification-code",
  authController.verifyVerificationCode
);

module.exports = router;

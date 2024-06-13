const express = require("express");
const router = express.Router();

const {
  registerUsers,
  login,
  getUsers,
  searchUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  verifyEmail,
  getUsersByCategory,
  categoryUsers,
  getProfile,
} = require("../controllers/user.controllers");

const { isUser } = require("../middleware/auth-Middleware");

router.post("/register", registerUsers);
router.post("/login", login);
router.get("/search", isUser, searchUser);
router.get("/getusersbycategory", getUsersByCategory);
router.get("/category-users", categoryUsers);
router.post("/forgot-password", forgotPassword);
router.post("/verifyotp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/verifyemail", verifyEmail);
router.get("/profile", isUser, getProfile);
router.put("/:id", isUser, updateProfile);
router.get("/:id", isUser, getUsers);

module.exports = router;

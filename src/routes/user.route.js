const express = require("express");
const router = express.Router();

const { registerUsers, login, getUsers, searchUser, updateProfile } = require("../controllers/user.controllers");

const { isUser } = require("../middleware/auth-Middleware");

router.post("/register", registerUsers);
router.get("/login", login);
router.get("/search", isUser, searchUser);
router.post("/update/:id", isUser, updateProfile);
router.get("/:id", isUser, getUsers);

module.exports = router;

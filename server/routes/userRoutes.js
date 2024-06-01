const express = require("express");
const router = express.Router();
const { registerUser, getUser, editUser, deleteUser } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

// Get user profile by username
router.get("/:username", getUser);

// Edit user profile by username
router.put("/:username", authenticate, authorize, editUser);

// Create user
router.post("/register", registerUser);

// Delete user profile by username
router.delete("/:username", authenticate, authorize, deleteUser);

module.exports = router;
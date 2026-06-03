const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/userController");
const { authUser, allUsers, updateProfile } = require("../controllers/userController")
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", registerUser);
router.post("/login", authUser);
router.get("/", protect, allUsers);
router.put("/profile", protect, updateProfile);
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;




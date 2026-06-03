const express = require("express");
const router = express.Router();

const { accessChat, fetchChats } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { createGroupChat } = require("../controllers/chatController");


router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  sendMessage,
  fetchMessages,
  markMessagesAsSeen,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);

router.get("/:chatId", protect, fetchMessages);

router.put("/seen", protect, markMessagesAsSeen);

module.exports = router;
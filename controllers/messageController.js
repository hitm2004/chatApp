const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({
      message: "Invalid data passed",
    });
  }

  let newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
    seenBy: [req.user._id],
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic username");

    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email username",
    });

    // update latest message
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);

  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);

  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const markMessagesAsSeen = async (req, res) => {

  const { chatId } = req.body;

  try {

    await Message.updateMany(
      {
        chat: chatId,

        seenBy: {
          $ne: req.user._id,
        },
      },

      {
        $push: {
          seenBy: req.user._id,
        },
      }
    );

    res.json({
      success: true,
    });

  } catch (error) {

    res.status(400).json({
      message: error.message,
    });

  }
};

module.exports = { sendMessage, fetchMessages, markMessagesAsSeen, }; 
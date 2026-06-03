const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId not sent" });
  }

  if (req.user._id.toString() === userId) {
  return res.status(400).json({
    message: "You cannot chat with yourself",
  });
}

  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (chat) {
    return res.send(chat);
  }

  // create new chat
  const newChat = await Chat.create({
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  });

  const fullChat = await Chat.findById(newChat._id).populate(
    "users",
    "-password"
  );

  res.status(201).json(fullChat);
};


const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createGroupChat = async (req, res) => {

  const { name, users } = req.body;

  if (!name || !users) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  let parsedUsers = JSON.parse(users);

  // minimum 2 users besides creator
  if (parsedUsers.length < 2) {
    return res.status(400).json({
      message: "Group must have at least 3 users",
    });
  }

  parsedUsers.push(req.user);

  try {

    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({
      _id: groupChat._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);

  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { accessChat, fetchChats,
  createGroupChat };
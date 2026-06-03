const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  const { name, username, email, password, pic } = req.body;

  if (!name || !username || !email || !password){
    return res.status(400).json({ message: "Please enter all fields" });
  }

  const userExists = await User.findOne({ email });

const usernameExists = await User.findOne({
  username,
});

if (usernameExists) {
  return res.status(400).json({
    message: "Username already exists",
  });
}

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
    pic,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
  });
};


const generateToken = require("../utils/generateToken");

const authUser = async (req, res) => {
  const { email, password, username } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

const allUsers = async (req, res) => {

  const keyword = req.query.search
    ? {
        $or: [
          {
            name: {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            username: {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ],
      }
    : {};

  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id },
  });

  res.send(users);
};

const updateProfile = async (req, res) => {

  const user = await User.findById(req.user._id);

  if (!user) {

    return res.status(404).json({
      message: "User not found",
    });

  }

  user.name = req.body.name || user.name;

  user.username =
    req.body.username || user.username;

  user.pic = req.body.pic || user.pic;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    pic: updatedUser.pic,
    token: generateToken(updatedUser._id),
  });
};

module.exports = { registerUser, authUser, allUsers, updateProfile };





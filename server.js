const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const server = app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join chat", (room) => {

  socket.join(room);

  console.log("Joined Chat Room:", room);

});

socket.on("typing", (room) => {

  console.log("TYPING EVENT:", room);
  socket.in(room).emit("typing");

});

socket.on("stop typing", (room) => {

  socket.in(room).emit("stop typing");

});

  socket.on("new message", (newMessageReceived) => {

  const chat = newMessageReceived.chat;

  if (!chat.users) return;

  chat.users.forEach((user) => {

  if (user._id == newMessageReceived.sender._id) return;

  socket.in(user._id).emit("message received", newMessageReceived);

});

});

socket.on("messages seen", (chatId) => {

  socket.in(chatId).emit("messages seen");

});

  socket.on("setup", (userData) => {
    socket.join(userData._id);

    console.log("User Joined:", userData._id);

    socket.emit("connected");

    onlineUsers[userData._id] = socket.id;

io.emit("online users", Object.keys(onlineUsers));

console.log(onlineUsers);

  });

  socket.on("disconnect", () => {

  for (let userId in onlineUsers) {

    if (onlineUsers[userId] === socket.id) {

      delete onlineUsers[userId];

      break;
    }
  }

  io.emit("online users", Object.keys(onlineUsers));

  console.log("User disconnected");

});
});


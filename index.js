const express = require("express");
const cors = require("cors");
const app = express();
/*const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});*/
const { UserRoute } = require("./routes/auth");
const { PostsRoute } = require("./routes/Posts");
const { CommentsRoute } = require("./routes/Comments");
const { ConversationRoute } = require("./routes/Conversation");
const { ChatRoute } = require("./routes/Chats");
const { OtpRoute } = require("./routes/Otp");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/auth", UserRoute);
app.use("/api/post", PostsRoute);
app.use("/api/comment", CommentsRoute);
app.use("/api/conversation", ConversationRoute);
app.use("/api/chat", ChatRoute);
app.use("/api/otp", OtpRoute);
const { connectToMongo } = require("./db");
const port = process.env.PORT || 7878;
/*let users = [];
const addUser = (SocketId, UserId) => {
  !users.some((user) => user.UserId === UserId) &&
    users.push({ UserId, SocketId });
};
let removeUser = (UserId) => {
  users = users.filter((id) => {
    id !== UserId;
  });
};
let getUser = (UserId) => {
  return users.find((user) => user.UserId === UserId);
};
io.on("connection", (socket) => {
  socket.on("addUser", (UserId) => {
    addUser(socket.id, UserId);
    io.emit("getUsers", users);
  });
  socket.on("disconnect", (UserId) => {
    removeUser(UserId);
  });
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.SocketId).emit("getMessage", {
        senderId,
        message,
      });
    }
  });
});

connectToMongo();
server.listen(port, () => {
  console.log("sever connected");
});*/
//connectToMongo();
app.listen(port, () => {
  console.log("sever connected");
});

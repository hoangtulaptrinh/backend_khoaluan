import express from "express";
import auth from "./middleware/auth";
import bodyParser from "body-parser";
import categoryRoutes from "./routes/category";
import cors from "cors";
import courseRoutes from "./routes/course";
import http from "http";
import mongoose from "mongoose";
import socket from "socket.io";
import topicRoutes from "./routes/topic";
import userRoutes from "./routes/user";

const app = express();
const port = 8080;

mongoose.connect("mongodb://localhost/khoa_luan", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(cors());

app.use("/api/protected", auth, (req, res) =>
  res.send(`Hi ${req.user.name},you are authenticated`)
);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/courses", courseRoutes);
app.use("/topics", topicRoutes);
app.use("/users", userRoutes);
app.use("/categorys", categoryRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Project Support",
  });
});

app.use((req, res, next) => {
  const err = new Error("not found"); // check nếu không tìm thấy router thì báo lỗi
  err.status = 404; // gắn cho err status là 404
  next(err); // để chạy tiếp gì đó bên dưới ở đây là báo lỗi ở bên dưới
});

app.use((err, req, res, next) =>
  res.status(err.status || 500).json({ error: { message: err.message } })
);

const server = http.Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

//io.on tức là bắt sự kiện lắng nghe
//io.on(connection) : lắng nghe sự kiện khi có người dùng kết nối
io.on("connection", (socket) => {
  console.log(`vừa có người kết nối và id là : ${socket.id}`);
  socket.on("Client-send-data", (data) => {
    //Case 1:
    //io.sockets.emit là sever gửi cho tất cả mọi người VD: A gửi => sever gửi cho tất cả mọi người
    // io.sockets.emit("Sever-send-data", data);
    //Case 2:
    //socket.emit là sever chỉ gửi cho chính người gửi lên thôi VD: A gửi => sever gửi lại A
    //socket.emit('Sever-send-data', `Data Sever Trả Về Nè ${data}`);
    socket.emit("Sever-send-data", {
      target: "you",
      messenger: data,
    });
    //Case 3:
    //socket.broadcast.emit là sever cho tất cả mọi người trừ người gửi VD: A gửi => sever gửi lại cho tất cả mọi người trừ A
    socket.broadcast.emit("Sever-send-data", {
      target: null,
      messenger: data,
    });
    //Case 4:
    //io.to('idSocket').emit là gửi riêng cho 1 người nào đó với idSocket truyền vào
    // io.to('idSocket').emit('???');
  });
  //io.on('disconnect',func) : lắng nghe sự kiện khi có người dùng ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`vừa có người ngắt kết nối và id là : ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server is live on ${port}. Yay!`);
});

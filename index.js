import express from "express";
import auth from "./middleware/auth";
import bodyParser from "body-parser";
import cors from "cors";
import courseRoutes from "./routes/course";
import mongoose from "mongoose";
import topicRoutes from "./routes/topic";
import userRoutes from "./routes/user";

const app = express();
const port = 5000;

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

app.listen(port, () => {
  console.log(`Server is live on ${port}. Yay!`);
});

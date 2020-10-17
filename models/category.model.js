import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  courses: Array,
  date_create: String,
});

//tham số thứ 3 là tên collection muốn lưu vào
const UserModel = mongoose.model("Category", userSchema, "categorys");

export default UserModel;

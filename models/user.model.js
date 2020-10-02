import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  date_of_birth: String,
  phone_number: String,
  money: String,
  role: String,
  course: Array,
});

//tham số thứ 3 là tên collection muốn lưu vào
const UserModel = mongoose.model("User", userSchema, "users");

export default UserModel;

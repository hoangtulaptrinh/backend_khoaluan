import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: String,
  intro: String,
  cost: String,
  references: Array,
  lesson: Array,
  image: String,
  outline: String,
});

//tham số thứ 3 là tên collection muốn lưu vào
const CourseModel = mongoose.model("Course", courseSchema, "courses");

export default CourseModel;

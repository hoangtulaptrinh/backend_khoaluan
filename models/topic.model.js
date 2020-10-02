import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  thread: Array,
});

//tham số thứ 3 là tên collection muốn lưu vào
const TopicModel = mongoose.model("Topic", topicSchema, "topics");

export default TopicModel;

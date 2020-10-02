import express from "express";

import {
  showAllThreadsOnTopic,
  detailThread,
  createThread,
  updateThread,
  addComment,
  updateComment,
} from "../controllers/topic";

const router = express.Router();

router.get("/show_all_threads_on_topic/:id", showAllThreadsOnTopic);

// router.get('/create', anyFunction);
router.get("/:id", detailThread); // phải để /:id ở dưới /create (get) vì để ở trên khi vào /create nó sẽ nhận id = create => underfined
router.post("/create/:id", createThread);
router.patch("/update_thread/:id", updateThread);
router.patch("/add_comment/:id", addComment);
router.patch("/update_comment/:id", updateComment);

export default router;

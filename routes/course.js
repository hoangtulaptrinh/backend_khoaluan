import express from "express";

import {
  showAllCourse,
  detailCourse,
  createCourse,
  updateCourse,
  createLesson,
  updateLesson,
} from "../controllers/course";

const router = express.Router();

router.get("/", showAllCourse);

// router.get('/create', anyFunction);
router.get("/:id", detailCourse); // phải để /:id ở dưới /create (get) vì để  ở trên khi vào /create nó sẽ nhận id = create => underfined
router.post("/create", createCourse);
router.patch("/update_course/:id", updateCourse);
router.post("/create_lesson/:id", createLesson);
router.patch("/update_lesson/:id", updateLesson);

export default router;

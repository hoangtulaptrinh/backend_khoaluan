import express from "express";

import {
  searchUser,
  showAllUser,
  detailUser,
  createUser,
  changePassword,
  updateInfo,
  deleteUser,
  buyCourse,
  updateProcessCourse,
  login,
} from "../controllers/user";

const router = express.Router();

router.get("/search", searchUser);

router.get("/", showAllUser);

// router.get('/create', anyFunction);
router.get("/:id", detailUser); // phải để /:id ở dưới /create (get) vì để  ở trên khi vào /create nó sẽ nhận id = create => underfined
router.post("/create", createUser);
router.patch("/change_password/:id", changePassword);
router.put("/update_info/:id", updateInfo);
router.delete("/:id", deleteUser);
router.patch("/buy_course/:id", buyCourse);
router.patch("/update_process_course/:id", updateProcessCourse);

router.post("/login", login);

export default router;

import express from "express";
import {
  createCategory,
  deleteCategory,
  detailCategory,
  showAllCategory,
  updateCategory,
} from "../controllers/category";

const router = express.Router();

router.get("/", showAllCategory);

router.get("/:id", detailCategory); // phải để /:id ở dưới /create (get) vì để  ở trên khi vào /create nó sẽ nhận id = create => underfined
router.post("/create", createCategory);
router.put("/update/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;

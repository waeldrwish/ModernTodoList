import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  toggleComplete,
  deleteTask,
} from "../controllers/task.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.patch("/:id/toggle", toggleComplete);
router.delete("/:id", deleteTask);

export default router;

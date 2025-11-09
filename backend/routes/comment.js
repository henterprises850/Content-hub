import express from "express";
import {
  createComment,
  getCommentsByContent,
  updateComment,
  deleteComment,
  likeComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createComment);
router.get("/content/:contentId", getCommentsByContent);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, likeComment);

export default router;

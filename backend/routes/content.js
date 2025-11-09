import express from "express";
import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
  likeContent,
  getContentStats,
} from "../controllers/contentController.js";
import { protect, admin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, upload.array("images", 5), createContent);
router.get("/", getAllContent);
router.get("/stats", protect, admin, getContentStats);
router.get("/:id", getContentById);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);
router.post("/:id/like", protect, likeContent);

export default router;

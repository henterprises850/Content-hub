import express from "express";
import {
  createCompetition,
  getAllCompetitions,
  getCompetitionById,
  registerForCompetition,
  updateCompetition,
  deleteCompetition,
} from "../controllers/competitioncontroller.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, admin, createCompetition);
router.get("/", getAllCompetitions);
router.get("/:id", getCompetitionById);
router.post("/:id/register", protect, registerForCompetition);
router.put("/:id", protect, admin, updateCompetition);
router.delete("/:id", protect, admin, deleteCompetition);

export default router;

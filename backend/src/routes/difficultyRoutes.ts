import { Router } from "express";
import {
  getAllDifficulties,
  createDifficulty,
  getDifficultyById,
  updateDifficulty,
  deleteDifficulty,
  initializeDefaultDifficulties
} from "../controllers/difficultyController";

const router = Router();

// Difficulty routes
router.get("/", getAllDifficulties);
router.post("/", createDifficulty);
router.post("/initialize", initializeDefaultDifficulties);
router.get("/:difficultyId", getDifficultyById);
router.put("/:difficultyId", updateDifficulty);
router.delete("/:difficultyId", deleteDifficulty);

export default router;

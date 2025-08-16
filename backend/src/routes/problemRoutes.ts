import { Router } from "express";
import {
  addProblem,
  getUserProblems,
  getProblemById,
  updateProblem,
  deleteProblem
} from "../controllers/problemController";

const router = Router();

// Problem routes
router.post("/", addProblem);
router.get("/user/:userId", getUserProblems);
router.get("/:problemId", getProblemById);
router.put("/:problemId", updateProblem);
router.delete("/:problemId", deleteProblem);

export default router;

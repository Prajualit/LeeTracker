import { Router } from "express";
import { getOrCreateUser, getUserStats } from "../controllers/userController";

const router = Router();

// User routes
router.post("/", getOrCreateUser);
router.get("/:userId/stats", getUserStats);

export default router;

import { Router } from "express";
import {
  getUserAnalytics,
  getPlatformAnalytics,
  getLeaderboard
} from "../controllers/analyticsController";

const router = Router();

// Analytics routes
router.get("/user/:userId", getUserAnalytics);
router.get("/platform", getPlatformAnalytics);
router.get("/leaderboard", getLeaderboard);

export default router;

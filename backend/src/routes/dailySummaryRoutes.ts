import { Router } from "express";
import {
  createOrUpdateDailySummary,
  getUserDailySummaries,
  getDailySummaryByDate,
  autoCalculateDailySummary,
  deleteDailySummary
} from "../controllers/dailySummaryController";

const router = Router();

// Daily summary routes
router.post("/", createOrUpdateDailySummary);
router.post("/auto-calculate", autoCalculateDailySummary);
router.get("/user/:userId", getUserDailySummaries);
router.get("/user/:userId/date/:date", getDailySummaryByDate);
router.delete("/:summaryId", deleteDailySummary);

export default router;

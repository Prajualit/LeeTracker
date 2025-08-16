import { Router } from "express";
import userRoutes from "./userRoutes";
import problemRoutes from "./problemRoutes";
import dailySummaryRoutes from "./dailySummaryRoutes";
import tagRoutes from "./tagRoutes";
import languageRoutes from "./languageRoutes";
import difficultyRoutes from "./difficultyRoutes";
import analyticsRoutes from "./analyticsRoutes";

const router = Router();

// API routes
router.use("/users", userRoutes);
router.use("/problems", problemRoutes);
router.use("/daily-summaries", dailySummaryRoutes);
router.use("/tags", tagRoutes);
router.use("/languages", languageRoutes);
router.use("/difficulties", difficultyRoutes);
router.use("/analytics", analyticsRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LeetTracker API is running successfully",
    timestamp: new Date().toISOString()
  });
});

export default router;

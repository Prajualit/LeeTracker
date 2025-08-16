import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../db/index";

// Create or update daily summary
const createOrUpdateDailySummary = asyncHandler(async (req: Request, res: Response) => {
  const { userId, date, totalMinutes } = req.body;

  if (!userId || !date || totalMinutes === undefined) {
    throw new ApiError(400, "User ID, date, and total minutes are required");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const summaryDate = new Date(date);
  summaryDate.setHours(0, 0, 0, 0); // Normalize to start of day

  // Check if summary already exists for this date
  const existingSummary = await prisma.dailySummary.findFirst({
    where: {
      userId,
      date: summaryDate
    }
  });

  let summary;
  if (existingSummary) {
    // Update existing summary
    summary = await prisma.dailySummary.update({
      where: { id: existingSummary.id },
      data: { totalMinutes },
      include: { user: true }
    });
  } else {
    // Create new summary
    summary = await prisma.dailySummary.create({
      data: {
        userId,
        date: summaryDate,
        totalMinutes
      },
      include: { user: true }
    });
  }

  return res
    .status(existingSummary ? 200 : 201)
    .json(new ApiResponse(
      existingSummary ? 200 : 201,
      summary,
      existingSummary ? "Daily summary updated successfully" : "Daily summary created successfully"
    ));
});

// Get daily summaries for a user
const getUserDailySummaries = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { startDate, endDate, limit = 30 } = req.query;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const where: any = { userId };

  // Add date range filter if provided
  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  const summaries = await prisma.dailySummary.findMany({
    where,
    orderBy: { date: 'desc' },
    take: Number(limit),
    include: { user: true }
  });

  // Calculate total minutes for the period
  const totalMinutes = summaries.reduce((sum, summary) => sum + summary.totalMinutes, 0);
  const averageMinutes = summaries.length > 0 ? totalMinutes / summaries.length : 0;

  const response = {
    summaries,
    stats: {
      totalDays: summaries.length,
      totalMinutes,
      averageMinutes: Math.round(averageMinutes * 100) / 100
    }
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Daily summaries retrieved successfully"));
});

// Get summary for a specific date
const getDailySummaryByDate = asyncHandler(async (req: Request, res: Response) => {
  const { userId, date } = req.params;

  if (!userId || !date) {
    throw new ApiError(400, "User ID and date are required");
  }

  const summaryDate = new Date(date);
  summaryDate.setHours(0, 0, 0, 0);

  const summary = await prisma.dailySummary.findFirst({
    where: {
      userId,
      date: summaryDate
    },
    include: { user: true }
  });

  if (!summary) {
    throw new ApiError(404, "Daily summary not found for the specified date");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Daily summary retrieved successfully"));
});

// Auto-calculate daily summary from problems solved
const autoCalculateDailySummary = asyncHandler(async (req: Request, res: Response) => {
  const { userId, date } = req.body;

  if (!userId || !date) {
    throw new ApiError(400, "User ID and date are required");
  }

  const summaryDate = new Date(date);
  const startOfDay = new Date(summaryDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(summaryDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all problems solved on this date
  const problemsOnDate = await prisma.problem.findMany({
    where: {
      userId,
      solvedAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // Calculate total time spent
  const totalMinutes = problemsOnDate.reduce((sum, problem) => sum + problem.timeSpentMin, 0);

  if (totalMinutes === 0) {
    throw new ApiError(404, "No problems found for the specified date");
  }

  // Create or update the daily summary
  const existingSummary = await prisma.dailySummary.findFirst({
    where: {
      userId,
      date: startOfDay
    }
  });

  let summary;
  if (existingSummary) {
    summary = await prisma.dailySummary.update({
      where: { id: existingSummary.id },
      data: { totalMinutes },
      include: { user: true }
    });
  } else {
    summary = await prisma.dailySummary.create({
      data: {
        userId,
        date: startOfDay,
        totalMinutes
      },
      include: { user: true }
    });
  }

  const response = {
    summary,
    problemsCount: problemsOnDate.length,
    problemsOnDate
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Daily summary auto-calculated successfully"));
});

// Delete daily summary
const deleteDailySummary = asyncHandler(async (req: Request, res: Response) => {
  const { summaryId } = req.params;

  if (!summaryId) {
    throw new ApiError(400, "Summary ID is required");
  }

  const summary = await prisma.dailySummary.findUnique({
    where: { id: summaryId }
  });

  if (!summary) {
    throw new ApiError(404, "Daily summary not found");
  }

  await prisma.dailySummary.delete({
    where: { id: summaryId }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Daily summary deleted successfully"));
});

export {
  createOrUpdateDailySummary,
  getUserDailySummaries,
  getDailySummaryByDate,
  autoCalculateDailySummary,
  deleteDailySummary
};

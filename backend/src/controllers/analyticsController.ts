import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../db/index";

// Get comprehensive analytics for a user
const getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Build date filter
  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.solvedAt = {};
    if (startDate) dateFilter.solvedAt.gte = new Date(startDate as string);
    if (endDate) dateFilter.solvedAt.lte = new Date(endDate as string);
  }

  // Get user with all problems
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      problemsSolved: {
        where: dateFilter,
        include: {
          difficulty: true,
          language: true,
          tags: true
        },
        orderBy: { solvedAt: 'desc' }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const problems = user.problemsSolved;

  // Basic statistics
  const totalProblems = problems.length;
  const totalTimeSpent = problems.reduce((sum: number, p: any) => sum + p.timeSpentMin, 0);
  const averageTimePerProblem = totalProblems > 0 ? Math.round((totalTimeSpent / totalProblems) * 100) / 100 : 0;

  // Difficulty breakdown
  const difficultyStats: Record<string, { count: number; timeSpent: number }> = {};
  problems.forEach(problem => {
    const level = problem.difficulty.level;
    if (!difficultyStats[level]) {
      difficultyStats[level] = { count: 0, timeSpent: 0 };
    }
    difficultyStats[level].count++;
    difficultyStats[level].timeSpent += problem.timeSpentMin;
  });

  // Language breakdown
  const languageStats: Record<string, { count: number; timeSpent: number }> = {};
  problems.forEach(problem => {
    const lang = problem.language.name;
    if (!languageStats[lang]) {
      languageStats[lang] = { count: 0, timeSpent: 0 };
    }
    languageStats[lang].count++;
    languageStats[lang].timeSpent += problem.timeSpentMin;
  });

  // Tag frequency
  const tagStats: Record<string, { count: number; timeSpent: number }> = {};
  problems.forEach(problem => {
    problem.tags.forEach(tag => {
      if (!tagStats[tag.name]) {
        tagStats[tag.name] = { count: 0, timeSpent: 0 };
      }
      const tagStat = tagStats[tag.name];
      if (tagStat) {
        tagStat.count++;
        tagStat.timeSpent += problem.timeSpentMin;
      }
    });
  });

  const analytics = {
    user: {
      id: user.id,
      username: user.username
    },
    overview: {
      totalProblems,
      totalTimeSpent,
      averageTimePerProblem
    },
    difficultyBreakdown: difficultyStats,
    languageBreakdown: languageStats,
    topTags: Object.entries(tagStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .reduce((acc: Record<string, any>, [tag, stats]) => {
        acc[tag] = stats;
        return acc;
      }, {}),
    dateRange: {
      startDate: startDate || null,
      endDate: endDate || null
    }
  };

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Analytics retrieved successfully"));
});

// Get platform-wide statistics
const getPlatformAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalProblems,
    totalTimeSpent
  ] = await Promise.all([
    prisma.user.count(),
    prisma.problem.count(),
    prisma.problem.aggregate({
      _sum: { timeSpentMin: true }
    })
  ]);

  const analytics = {
    overview: {
      totalUsers,
      totalProblems,
      totalTimeSpent: totalTimeSpent._sum.timeSpentMin || 0,
      averageProblemsPerUser: totalUsers > 0 ? Math.round((totalProblems / totalUsers) * 100) / 100 : 0
    }
  };

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Platform analytics retrieved successfully"));
});

// Get leaderboard
const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const users = await prisma.user.findMany({
    include: {
      problemsSolved: {
        select: {
          timeSpentMin: true
        }
      }
    }
  });

  const usersWithStats = users.map(user => ({
    id: user.id,
    username: user.username,
    problemCount: user.problemsSolved.length,
    totalTimeSpent: user.problemsSolved.reduce((sum, p) => sum + p.timeSpentMin, 0)
  }));

  const sortedUsers = usersWithStats
    .sort((a, b) => b.problemCount - a.problemCount)
    .slice(0, Number(limit));

  return res
    .status(200)
    .json(new ApiResponse(200, sortedUsers, "Leaderboard retrieved successfully"));
});

export {
  getUserAnalytics,
  getPlatformAnalytics,
  getLeaderboard
};

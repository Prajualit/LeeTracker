import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../db/index";

// Get or create user
const getOrCreateUser = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  let user = await prisma.user.findUnique({
    where: { username },
    include: {
      problemsSolved: {
        include: {
          difficulty: true,
          tags: true,
          language: true,
        },
      },
      summaries: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username },
      include: {
        problemsSolved: {
          include: {
            difficulty: true,
            tags: true,
            language: true,
          },
        },
        summaries: true,
      },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved/created successfully"));
});

// Get user statistics
const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      problemsSolved: {
        include: {
          difficulty: true,
          tags: true,
          language: true,
        },
      },
      summaries: {
        orderBy: { date: "desc" },
        take: 30, // Last 30 days
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Calculate statistics
  const totalProblems = user.problemsSolved.length;
  const difficultyBreakdown = user.problemsSolved.reduce((acc: Record<string, number>, problem: any) => {
    const level = problem.difficulty.level;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const languageBreakdown = user.problemsSolved.reduce((acc: Record<string, number>, problem: any) => {
    const lang = problem.language.name;
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTimeSpent = user.problemsSolved.reduce(
    (acc: number, problem: any) => acc + problem.timeSpentMin,
    0
  );

  const stats = {
    user: {
      id: user.id,
      username: user.username,
    },
    totalProblems,
    difficultyBreakdown,
    languageBreakdown,
    totalTimeSpent,
    recentSummaries: user.summaries,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "User statistics retrieved successfully"));
});

export { getOrCreateUser, getUserStats };

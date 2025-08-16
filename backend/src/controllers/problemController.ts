import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../db/index";

// Add a new problem
const addProblem = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    leetcodeId,
    userId,
    difficultyLevel,
    languageName,
    tagNames,
    timeSpentMin
  } = req.body;

  if (!title || !leetcodeId || !userId || !difficultyLevel || !languageName || !timeSpentMin) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get or create difficulty
  let difficulty = await prisma.difficulty.findUnique({
    where: { level: difficultyLevel }
  });

  if (!difficulty) {
    difficulty = await prisma.difficulty.create({
      data: { level: difficultyLevel }
    });
  }

  // Get or create language
  let language = await prisma.language.findUnique({
    where: { name: languageName }
  });

  if (!language) {
    language = await prisma.language.create({
      data: { name: languageName }
    });
  }

  // Get or create tags
  const tags = [];
  if (tagNames && Array.isArray(tagNames)) {
    for (const tagName of tagNames) {
      let tag = await prisma.tag.findUnique({
        where: { name: tagName }
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName }
        });
      }
      tags.push(tag);
    }
  }

  // Create the problem
  const problem = await prisma.problem.create({
    data: {
      title,
      leetcodeId,
      userId,
      difficultyId: difficulty.id,
      languageId: language.id,
      timeSpentMin,
      tags: {
        connect: tags.map(tag => ({ id: tag.id }))
      }
    },
    include: {
      difficulty: true,
      language: true,
      tags: true,
      user: true
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, problem, "Problem added successfully"));
});

// Get all problems for a user
const getUserProblems = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, difficulty, language, tag } = req.query;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Build filter conditions
  const where: any = { userId };

  if (difficulty) {
    where.difficulty = {
      level: difficulty
    };
  }

  if (language) {
    where.language = {
      name: language
    };
  }

  if (tag) {
    where.tags = {
      some: {
        name: tag
      }
    };
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      include: {
        difficulty: true,
        language: true,
        tags: true
      },
      orderBy: { solvedAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.problem.count({ where })
  ]);

  const response = {
    problems,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProblems: total,
      hasNext: skip + Number(limit) < total,
      hasPrev: Number(page) > 1
    }
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Problems retrieved successfully"));
});

// Get problem by ID
const getProblemById = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;

  if (!problemId) {
    throw new ApiError(400, "Problem ID is required");
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      difficulty: true,
      language: true,
      tags: true,
      user: true
    }
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem retrieved successfully"));
});

// Update problem
const updateProblem = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const { title, difficultyLevel, languageName, tagNames, timeSpentMin } = req.body;

  if (!problemId) {
    throw new ApiError(400, "Problem ID is required");
  }

  const existingProblem = await prisma.problem.findUnique({
    where: { id: problemId }
  });

  if (!existingProblem) {
    throw new ApiError(404, "Problem not found");
  }

  const updateData: any = {};

  if (title) updateData.title = title;
  if (timeSpentMin) updateData.timeSpentMin = timeSpentMin;

  if (difficultyLevel) {
    let difficulty = await prisma.difficulty.findUnique({
      where: { level: difficultyLevel }
    });

    if (!difficulty) {
      difficulty = await prisma.difficulty.create({
        data: { level: difficultyLevel }
      });
    }
    updateData.difficultyId = difficulty.id;
  }

  if (languageName) {
    let language = await prisma.language.findUnique({
      where: { name: languageName }
    });

    if (!language) {
      language = await prisma.language.create({
        data: { name: languageName }
      });
    }
    updateData.languageId = language.id;
  }

  const problem = await prisma.problem.update({
    where: { id: problemId },
    data: updateData,
    include: {
      difficulty: true,
      language: true,
      tags: true,
      user: true
    }
  });

  // Handle tags separately if provided
  if (tagNames && Array.isArray(tagNames)) {
    // Disconnect all existing tags
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        tags: {
          set: []
        }
      }
    });

    // Connect new tags
    const tags = [];
    for (const tagName of tagNames) {
      let tag = await prisma.tag.findUnique({
        where: { name: tagName }
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName }
        });
      }
      tags.push(tag);
    }

    await prisma.problem.update({
      where: { id: problemId },
      data: {
        tags: {
          connect: tags.map(tag => ({ id: tag.id }))
        }
      }
    });
  }

  const updatedProblem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      difficulty: true,
      language: true,
      tags: true,
      user: true
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProblem, "Problem updated successfully"));
});

// Delete problem
const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;

  if (!problemId) {
    throw new ApiError(400, "Problem ID is required");
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId }
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  await prisma.problem.delete({
    where: { id: problemId }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Problem deleted successfully"));
});

export {
  addProblem,
  getUserProblems,
  getProblemById,
  updateProblem,
  deleteProblem
};

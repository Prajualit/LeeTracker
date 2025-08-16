import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../db/index";

// Get all difficulties
const getAllDifficulties = asyncHandler(async (req: Request, res: Response) => {
  const difficulties = await prisma.difficulty.findMany({
    include: {
      _count: {
        select: { problems: true }
      }
    },
    orderBy: { id: 'asc' }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, difficulties, "Difficulties retrieved successfully"));
});

// Create a new difficulty
const createDifficulty = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.body;

  if (!level) {
    throw new ApiError(400, "Difficulty level is required");
  }

  // Validate difficulty level
  const validLevels = ['Easy', 'Medium', 'Hard'];
  if (!validLevels.includes(level)) {
    throw new ApiError(400, "Difficulty level must be one of: Easy, Medium, Hard");
  }

  // Check if difficulty already exists
  const existingDifficulty = await prisma.difficulty.findUnique({
    where: { level }
  });

  if (existingDifficulty) {
    throw new ApiError(409, "Difficulty level already exists");
  }

  const difficulty = await prisma.difficulty.create({
    data: { level },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, difficulty, "Difficulty created successfully"));
});

// Get difficulty by ID with associated problems
const getDifficultyById = asyncHandler(async (req: Request, res: Response) => {
  const { difficultyId } = req.params;

  if (!difficultyId) {
    throw new ApiError(400, "Difficulty ID is required");
  }

  const difficulty = await prisma.difficulty.findUnique({
    where: { id: Number(difficultyId) },
    include: {
      problems: {
        include: {
          tags: true,
          language: true,
          user: true
        },
        orderBy: { solvedAt: 'desc' }
      },
      _count: {
        select: { problems: true }
      }
    }
  });

  if (!difficulty) {
    throw new ApiError(404, "Difficulty not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, difficulty, "Difficulty retrieved successfully"));
});

// Update difficulty
const updateDifficulty = asyncHandler(async (req: Request, res: Response) => {
  const { difficultyId } = req.params;
  const { level } = req.body;

  if (!difficultyId) {
    throw new ApiError(400, "Difficulty ID is required");
  }

  if (!level) {
    throw new ApiError(400, "Difficulty level is required");
  }

  // Validate difficulty level
  const validLevels = ['Easy', 'Medium', 'Hard'];
  if (!validLevels.includes(level)) {
    throw new ApiError(400, "Difficulty level must be one of: Easy, Medium, Hard");
  }

  // Check if difficulty exists
  const existingDifficulty = await prisma.difficulty.findUnique({
    where: { id: Number(difficultyId) }
  });

  if (!existingDifficulty) {
    throw new ApiError(404, "Difficulty not found");
  }

  // Check if new level already exists (and it's not the same difficulty)
  const levelConflict = await prisma.difficulty.findUnique({
    where: { level }
  });

  if (levelConflict && levelConflict.id !== Number(difficultyId)) {
    throw new ApiError(409, "Difficulty with this level already exists");
  }

  const difficulty = await prisma.difficulty.update({
    where: { id: Number(difficultyId) },
    data: { level },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, difficulty, "Difficulty updated successfully"));
});

// Delete difficulty
const deleteDifficulty = asyncHandler(async (req: Request, res: Response) => {
  const { difficultyId } = req.params;

  if (!difficultyId) {
    throw new ApiError(400, "Difficulty ID is required");
  }

  const difficulty = await prisma.difficulty.findUnique({
    where: { id: Number(difficultyId) },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  if (!difficulty) {
    throw new ApiError(404, "Difficulty not found");
  }

  if (difficulty._count.problems > 0) {
    throw new ApiError(400, `Cannot delete difficulty. It is associated with ${difficulty._count.problems} problem(s)`);
  }

  await prisma.difficulty.delete({
    where: { id: Number(difficultyId) }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Difficulty deleted successfully"));
});

// Initialize default difficulties
const initializeDefaultDifficulties = asyncHandler(async (req: Request, res: Response) => {
  const defaultLevels = ['Easy', 'Medium', 'Hard'];
  const createdDifficulties = [];

  for (const level of defaultLevels) {
    const existingDifficulty = await prisma.difficulty.findUnique({
      where: { level }
    });

    if (!existingDifficulty) {
      const difficulty = await prisma.difficulty.create({
        data: { level },
        include: {
          _count: {
            select: { problems: true }
          }
        }
      });
      createdDifficulties.push(difficulty);
    }
  }

  if (createdDifficulties.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "All default difficulties already exist"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdDifficulties, "Default difficulties initialized successfully"));
});

export {
  getAllDifficulties,
  createDifficulty,
  getDifficultyById,
  updateDifficulty,
  deleteDifficulty,
  initializeDefaultDifficulties
};

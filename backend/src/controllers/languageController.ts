import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../db/index";

// Get all languages
const getAllLanguages = asyncHandler(async (req: Request, res: Response) => {
  const languages = await prisma.language.findMany({
    include: {
      _count: {
        select: { problems: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, languages, "Languages retrieved successfully"));
});

// Create a new language
const createLanguage = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Language name is required");
  }

  // Check if language already exists
  const existingLanguage = await prisma.language.findUnique({
    where: { name }
  });

  if (existingLanguage) {
    throw new ApiError(409, "Language already exists");
  }

  const language = await prisma.language.create({
    data: { name },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, language, "Language created successfully"));
});

// Get language by ID with associated problems
const getLanguageById = asyncHandler(async (req: Request, res: Response) => {
  const { languageId } = req.params;

  if (!languageId) {
    throw new ApiError(400, "Language ID is required");
  }

  const language = await prisma.language.findUnique({
    where: { id: Number(languageId) },
    include: {
      problems: {
        include: {
          difficulty: true,
          tags: true,
          user: true
        },
        orderBy: { solvedAt: 'desc' }
      },
      _count: {
        select: { problems: true }
      }
    }
  });

  if (!language) {
    throw new ApiError(404, "Language not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, language, "Language retrieved successfully"));
});

// Update language
const updateLanguage = asyncHandler(async (req: Request, res: Response) => {
  const { languageId } = req.params;
  const { name } = req.body;

  if (!languageId) {
    throw new ApiError(400, "Language ID is required");
  }

  if (!name) {
    throw new ApiError(400, "Language name is required");
  }

  // Check if language exists
  const existingLanguage = await prisma.language.findUnique({
    where: { id: Number(languageId) }
  });

  if (!existingLanguage) {
    throw new ApiError(404, "Language not found");
  }

  // Check if new name already exists (and it's not the same language)
  const nameConflict = await prisma.language.findUnique({
    where: { name }
  });

  if (nameConflict && nameConflict.id !== Number(languageId)) {
    throw new ApiError(409, "Language with this name already exists");
  }

  const language = await prisma.language.update({
    where: { id: Number(languageId) },
    data: { name },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, language, "Language updated successfully"));
});

// Delete language
const deleteLanguage = asyncHandler(async (req: Request, res: Response) => {
  const { languageId } = req.params;

  if (!languageId) {
    throw new ApiError(400, "Language ID is required");
  }

  const language = await prisma.language.findUnique({
    where: { id: Number(languageId) },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  if (!language) {
    throw new ApiError(404, "Language not found");
  }

  if (language._count.problems > 0) {
    throw new ApiError(400, `Cannot delete language. It is associated with ${language._count.problems} problem(s)`);
  }

  await prisma.language.delete({
    where: { id: Number(languageId) }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Language deleted successfully"));
});

// Get popular languages (most used)
const getPopularLanguages = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const languages = await prisma.language.findMany({
    include: {
      _count: {
        select: { problems: true }
      }
    },
    orderBy: {
      problems: {
        _count: 'desc'
      }
    },
    take: Number(limit)
  });

  return res
    .status(200)
    .json(new ApiResponse(200, languages, "Popular languages retrieved successfully"));
});

export {
  getAllLanguages,
  createLanguage,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
  getPopularLanguages
};

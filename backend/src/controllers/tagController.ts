import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../db/index";

// Get all tags
const getAllTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { problems: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tags, "Tags retrieved successfully"));
});

// Create a new tag
const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Tag name is required");
  }

  // Check if tag already exists
  const existingTag = await prisma.tag.findUnique({
    where: { name }
  });

  if (existingTag) {
    throw new ApiError(409, "Tag already exists");
  }

  const tag = await prisma.tag.create({
    data: { name },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tag, "Tag created successfully"));
});

// Get tag by ID with associated problems
const getTagById = asyncHandler(async (req: Request, res: Response) => {
  const { tagId } = req.params;

  if (!tagId) {
    throw new ApiError(400, "Tag ID is required");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: Number(tagId) },
    include: {
      problems: {
        include: {
          difficulty: true,
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

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tag, "Tag retrieved successfully"));
});

// Update tag
const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const { tagId } = req.params;
  const { name } = req.body;

  if (!tagId) {
    throw new ApiError(400, "Tag ID is required");
  }

  if (!name) {
    throw new ApiError(400, "Tag name is required");
  }

  // Check if tag exists
  const existingTag = await prisma.tag.findUnique({
    where: { id: Number(tagId) }
  });

  if (!existingTag) {
    throw new ApiError(404, "Tag not found");
  }

  // Check if new name already exists (and it's not the same tag)
  const nameConflict = await prisma.tag.findUnique({
    where: { name }
  });

  if (nameConflict && nameConflict.id !== Number(tagId)) {
    throw new ApiError(409, "Tag with this name already exists");
  }

  const tag = await prisma.tag.update({
    where: { id: Number(tagId) },
    data: { name },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tag, "Tag updated successfully"));
});

// Delete tag
const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { tagId } = req.params;

  if (!tagId) {
    throw new ApiError(400, "Tag ID is required");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: Number(tagId) },
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  if (tag._count.problems > 0) {
    throw new ApiError(400, `Cannot delete tag. It is associated with ${tag._count.problems} problem(s)`);
  }

  await prisma.tag.delete({
    where: { id: Number(tagId) }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tag deleted successfully"));
});

// Get popular tags (most used)
const getPopularTags = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const tags = await prisma.tag.findMany({
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
    .json(new ApiResponse(200, tags, "Popular tags retrieved successfully"));
});

export {
  getAllTags,
  createTag,
  getTagById,
  updateTag,
  deleteTag,
  getPopularTags
};

import { Router } from "express";
import {
  getAllTags,
  createTag,
  getTagById,
  updateTag,
  deleteTag,
  getPopularTags
} from "../controllers/tagController";

const router = Router();

// Tag routes
router.get("/", getAllTags);
router.get("/popular", getPopularTags);
router.post("/", createTag);
router.get("/:tagId", getTagById);
router.put("/:tagId", updateTag);
router.delete("/:tagId", deleteTag);

export default router;

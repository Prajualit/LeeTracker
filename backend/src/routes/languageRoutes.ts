import { Router } from "express";
import {
  getAllLanguages,
  createLanguage,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
  getPopularLanguages
} from "../controllers/languageController";

const router = Router();

// Language routes
router.get("/", getAllLanguages);
router.get("/popular", getPopularLanguages);
router.post("/", createLanguage);
router.get("/:languageId", getLanguageById);
router.put("/:languageId", updateLanguage);
router.delete("/:languageId", deleteLanguage);

export default router;

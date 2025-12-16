import { Router } from "express";
import {
  listFavorites,
  addFavorite,
  removeFavorite,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.get("/", verifyToken, listFavorites);
router.post("/", verifyToken, addFavorite);
router.delete("/:id", verifyToken, removeFavorite);

export default router;
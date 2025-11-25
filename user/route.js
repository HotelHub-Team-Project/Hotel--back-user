import { Router } from "express";
import { applyBusiness } from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.post("/business-apply", verifyToken, applyBusiness);

export default router;

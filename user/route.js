import { Router } from "express";
import {
  applyBusiness,
  updateProfile,
  changePassword,
  updateProfileImage,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.use(verifyToken);

router.post("/business-apply", applyBusiness);
router.patch("/profile", updateProfile);
router.patch("/password", changePassword);
router.patch("/profile/image", updateProfileImage);

export default router;

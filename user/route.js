import { Router } from "express";
import {
  updateProfile,
  changePassword,
  updateProfileImage,
  getProfileImageUploadUrl,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.use(verifyToken);

router.patch("/profile", updateProfile);
router.patch("/password", changePassword);
router.patch("/profile/image", updateProfileImage);
router.post("/profile/image/upload-url", getProfileImageUploadUrl);

export default router;

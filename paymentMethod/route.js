import { Router } from "express";
import {
  createPaymentMethod,
  listPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.use(verifyToken);

router.get("/", listPaymentMethods);
router.post("/", createPaymentMethod);
router.delete("/:id", deletePaymentMethod);
router.patch("/:id/default", setDefaultPaymentMethod);

export default router;

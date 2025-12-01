import { Router } from "express";
import {
  listHotels,
  getHotelDetail,
  listRoomsByHotel,
  listRooms,
} from "./controller.js";
import { optionalAuth } from "../common/authMiddleware.js";

const router = Router();

router.get("/", optionalAuth, listHotels);
router.get("/rooms", optionalAuth, listRooms);
router.get("/:id/rooms", optionalAuth, listRoomsByHotel);
router.get("/:id", optionalAuth, getHotelDetail);

export default router;

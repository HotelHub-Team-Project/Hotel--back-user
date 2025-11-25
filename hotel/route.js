import { Router } from "express";
import {
  listHotels,
  getHotelDetail,
  listRoomsByHotel,
  listRooms,
} from "./controller.js";

const router = Router();

router.get("/", listHotels);
router.get("/rooms", listRooms);
router.get("/:id/rooms", listRoomsByHotel);
router.get("/:id", getHotelDetail);

export default router;

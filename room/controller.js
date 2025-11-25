import * as roomService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

export const getRooms = async (req, res) => {
  try {
    const { hotelId, guests, checkIn, checkOut } = req.query;
    const data = await roomService.getAvailableRooms({
      hotelId,
      guests,
      checkIn,
      checkOut,
    });
    return res.status(200).json(successResponse(data, "ROOM_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

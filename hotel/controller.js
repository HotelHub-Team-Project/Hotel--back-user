import * as hotelService from "./service.js";
import * as roomService from "../room/service.js";
import { successResponse, errorResponse } from "../common/response.js";

export const listHotels = async (req, res) => {
  try {
    const { city, guests } = req.query;
    const data = await hotelService.listHotels({ city, guests });
    return res.status(200).json(successResponse(data, "HOTEL_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const getHotelDetail = async (req, res) => {
  try {
    const data = await hotelService.getHotelDetail(req.params.id);
    return res.status(200).json(successResponse(data, "HOTEL_DETAIL", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 404)
      .json(errorResponse(err.message, err.statusCode || 404));
  }
};

export const listRoomsByHotel = async (req, res) => {
  try {
    const data = await hotelService.listRoomsByHotel(req.params.id);
    return res.status(200).json(successResponse(data, "ROOMS_BY_HOTEL", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const listRooms = async (req, res) => {
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

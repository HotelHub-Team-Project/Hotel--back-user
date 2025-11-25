import { Hotel } from "./model.js";
import { Room } from "../room/model.js";
import { Review } from "../review/model.js";
import * as roomService from "../room/service.js";

export const listHotels = async ({ city, guests }) => {
  const query = { status: "approved" };
  if (city) query.city = city;

  if (guests) {
    const rooms = await Room.find({
      capacity: { $gte: Number(guests) },
      status: "active",
    }).distinct("hotel");
    query._id = { $in: rooms };
  }

  return Hotel.find(query).sort({ createdAt: -1 });
};

export const getHotelDetail = async (id) => {
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const rooms = await roomService.getRoomsByHotel(id);
  const reviews = await Review.find({ hotelId: id })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  return { hotel, rooms, reviews };
};

export const listRoomsByHotel = async (id) => {
  return roomService.getRoomsByHotel(id);
};

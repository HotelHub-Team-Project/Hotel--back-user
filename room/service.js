import { Room } from "./model.js";
import { Reservation } from "../reservation/model.js";

const getReservedRoomIds = async (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return [];

  const overlap = await Reservation.find({
    status: { $nin: ["cancelled"] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  }).select("roomId");

  return overlap.map((r) => r.roomId);
};

export const getAvailableRooms = async ({ hotelId, guests, checkIn, checkOut }) => {
  const reservedRoomIds = await getReservedRoomIds(checkIn, checkOut);

  const filter = { status: "active" };
  if (hotelId) filter.hotel = hotelId;
  if (guests) filter.capacity = { $gte: Number(guests) };
  if (reservedRoomIds.length) filter._id = { $nin: reservedRoomIds };

  return Room.find(filter)
    .populate("hotel", "name city ratingAverage ratingCount address images")
    .lean();
};

export const getRoomsByHotel = async (hotelId) => {
  return Room.find({ hotel: hotelId, status: "active" }).sort({ price: 1 });
};

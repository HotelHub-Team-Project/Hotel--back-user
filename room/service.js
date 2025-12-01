import { Room } from "./model.js";
import { Reservation } from "../reservation/model.js";

const getReservedCountMap = async ({ hotelId, roomIds, checkIn, checkOut }) => {
  if (!checkIn || !checkOut) return {};

  const match = {
    status: { $nin: ["cancelled"] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };
  if (hotelId) match.hotelId = hotelId;
  if (roomIds?.length) match.roomId = { $in: roomIds };

  const grouped = await Reservation.aggregate([
    { $match: match },
    { $group: { _id: "$roomId", count: { $sum: 1 } } },
  ]);

  return grouped.reduce((acc, cur) => {
    acc[cur._id.toString()] = cur.count;
    return acc;
  }, {});
};

const withAvailableInventory = (rooms, reservedCountMap, checkIn, checkOut) => {
  return rooms
    .map((room) => {
      const inventory =
        typeof room.inventory === "number" && !Number.isNaN(room.inventory)
          ? room.inventory
          : 1;
      const reserved = reservedCountMap[room._id.toString()] || 0;
      const availableInventory = Math.max(0, inventory - reserved);
      return { ...room, availableInventory };
    })
    .filter((room) => {
      if (checkIn && checkOut) {
        return room.availableInventory > 0;
      }
      return true;
    });
};

export const getAvailableRooms = async ({ hotelId, guests, checkIn, checkOut }) => {
  const filter = { status: "active" };
  if (hotelId) filter.hotel = hotelId;
  if (guests) filter.capacity = { $gte: Number(guests) };

  const rooms = await Room.find(filter)
    .populate("hotel", "name city ratingAverage ratingCount address images")
    .lean();

  const reservedCountMap = await getReservedCountMap({
    hotelId,
    roomIds: rooms.map((r) => r._id),
    checkIn,
    checkOut,
  });

  return withAvailableInventory(rooms, reservedCountMap, checkIn, checkOut);
};

export const getRoomsByHotel = async (hotelId, options = {}) => {
  const { checkIn, checkOut } = options;
  const rooms = await Room.find({ hotel: hotelId, status: "active" })
    .sort({ price: 1 })
    .lean();

  const reservedCountMap = await getReservedCountMap({
    hotelId,
    roomIds: rooms.map((r) => r._id),
    checkIn,
    checkOut,
  });

  return withAvailableInventory(rooms, reservedCountMap, checkIn, checkOut);
};

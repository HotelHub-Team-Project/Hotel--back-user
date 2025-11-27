import { Hotel } from "./model.js";
import { Room } from "../room/model.js";
import { Review } from "../review/model.js";
import * as roomService from "../room/service.js";

const normalizeHotels = (docs) =>
  docs.map((doc) =>
    typeof doc.toJSON === "function" ? doc.toJSON() : Hotel.hydrate(doc).toJSON()
  );

export const listHotels = async ({ city, guests, sort, page = 1, limit = 10 }) => {
  const query = { status: "approved" };
  if (city) query.city = city;

  if (guests) {
    const rooms = await Room.find({
      capacity: { $gte: Number(guests) },
      status: "active",
    }).distinct("hotel");
    query._id = { $in: rooms };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Hotel.countDocuments(query);

  let items = [];
  if (sort === "recommend") {
    const aggregated = await Hotel.aggregate([
      { $match: query },
      { $addFields: { rand: { $rand: {} } } },
      { $sort: { rand: 1 } },
      { $skip: skip },
      { $limit: limitNum },
    ]);
    items = normalizeHotels(aggregated);
  } else {
    const sortOptions = {
      popular: { ratingCount: -1, ratingAverage: -1, createdAt: -1 },
      rating: { ratingAverage: -1, ratingCount: -1, createdAt: -1 },
      default: { createdAt: -1 },
    };
    const sortRule = sortOptions[sort] || sortOptions.default;
    const docs = await Hotel.find(query).sort(sortRule).skip(skip).limit(limitNum);
    items = normalizeHotels(docs);
  }

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
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

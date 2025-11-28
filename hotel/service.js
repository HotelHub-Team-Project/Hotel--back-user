import { Hotel } from "./model.js";
import { Room } from "../room/model.js";
import { Review } from "../review/model.js";
import { Reservation } from "../reservation/model.js";
import * as roomService from "../room/service.js";

const normalizeHotels = (docs) =>
  docs.map((doc) =>
    typeof doc.toJSON === "function" ? doc.toJSON() : Hotel.hydrate(doc).toJSON()
  );

const parseArray = (value) =>
  typeof value === "string"
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

const getReservedRoomIds = async (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return [];

  const overlap = await Reservation.find({
    status: { $nin: ["cancelled"] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  }).select("roomId");

  return overlap.map((r) => r.roomId);
};

export const listHotels = async ({
  city,
  guests,
  sort,
  page = 1,
  limit = 10,
  priceMin,
  priceMax,
  ratingMin,
  amenities,
  freebies,
  checkIn,
  checkOut,
}) => {
  const query = { status: "approved" };
  if (city) query.city = city;
  if (ratingMin !== undefined) {
    query.ratingAverage = { $gte: Number(ratingMin) };
  }

  const amenitiesList = parseArray(amenities);
  const freebiesList = parseArray(freebies);

  // 추가 필터가 있을 때만 rooms 조회로 필터링
  const needsRoomFilter =
    guests ||
    priceMin !== undefined ||
    priceMax !== undefined ||
    amenitiesList.length ||
    freebiesList.length ||
    (checkIn && checkOut);

  if (needsRoomFilter) {
    const requiredAmenities = [...amenitiesList, ...freebiesList];

    const roomFilter = { status: "active" };
    if (guests) roomFilter.capacity = { $gte: Number(guests) };

    const priceFilter = {};
    if (priceMin !== undefined) priceFilter.$gte = Number(priceMin);
    if (priceMax !== undefined) priceFilter.$lte = Number(priceMax);
    if (Object.keys(priceFilter).length) roomFilter.price = priceFilter;

    if (checkIn && checkOut) {
      const reservedRoomIds = await getReservedRoomIds(checkIn, checkOut);
      if (reservedRoomIds.length) {
        roomFilter._id = { $nin: reservedRoomIds };
      }
    }

    if (requiredAmenities.length) {
      roomFilter.amenities = { $all: requiredAmenities };
    }

    const rooms = await Room.find(roomFilter).distinct("hotel");
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

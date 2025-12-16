import mongoose from "mongoose";
import { Favorite } from "./model.js";
import { Hotel } from "../hotel/model.js";

export const listFavorites = async (userId) => {
  const favorites = await Favorite.find({ user: userId }).populate(
    "hotel",
    "name city address images ratingAverage ratingCount basePrice status"
  );

  // 프론트에서 바로 호텔 정보를 쓰도록 hotel 필드를 추가
  return favorites.map((fav) => {
    const json = fav.toJSON();
    return {
      ...json,
      hotel: fav.hotel ? fav.hotel.toJSON() : undefined,
      hotelId: fav.hotel?._id || fav.hotel, // 안전하게 id 유지
    };
  });
};

export const addFavorite = async (userId, hotelId) => {
  if (!hotelId || !mongoose.isValidObjectId(hotelId)) {
    const err = new Error("INVALID_HOTEL_ID");
    err.statusCode = 400;
    console.error("[FAVORITE_ADD] invalid hotelId:", hotelId);
    throw err;
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const favorite = await Favorite.findOneAndUpdate(
    { user: userId, hotel: hotelId },
    { user: userId, hotel: hotelId },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true, context: "query" }
  ).populate("hotel", "name city address images ratingAverage ratingCount basePrice status");

  const json = favorite.toJSON();
  return {
    ...json,
    hotel: favorite.hotel ? favorite.hotel.toJSON() : undefined,
    hotelId: favorite.hotel?._id || favorite.hotel,
  };
};

export const removeFavorite = async (userId, favoriteId) => {
  const deleted = await Favorite.findOneAndDelete({ _id: favoriteId, user: userId });
  if (!deleted) {
    const err = new Error("FAVORITE_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  return deleted;
};

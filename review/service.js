import { Review } from "./model.js";
import { Reservation } from "../reservation/model.js";
import { Hotel } from "../hotel/model.js";

export const createReview = async (userId, payload) => {
  const { reservationId, hotelId, rating, comment, images } = payload;

  const reservation = await Reservation.findById(reservationId);
  if (!reservation || reservation.status !== "confirmed") {
    const err = new Error("REVIEW_NOT_ALLOWED");
    err.statusCode = 400;
    throw err;
  }
  if (reservation.userId.toString() !== userId.toString()) {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  const review = await Review.create({
    userId,
    reservationId,
    hotelId,
    rating,
    comment,
    images,
  });

  const hotel = await Hotel.findById(hotelId);
  if (hotel) {
    const newCount = (hotel.ratingCount || 0) + 1;
    const newAvg =
      ((hotel.ratingAverage || 0) * (hotel.ratingCount || 0) + rating) /
      newCount;
    hotel.ratingAverage = newAvg;
    hotel.ratingCount = newCount;
    await hotel.save();
  }

  return review;
};

export const getReviews = async (hotelId) => {
  const query = {};
  if (hotelId) query.hotelId = hotelId;

  return Review.find(query)
    .populate("userId", "name")
    .sort({ createdAt: -1 });
};

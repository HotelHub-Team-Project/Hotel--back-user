import { Review } from "./model.js";
import { Reservation } from "../reservation/model.js";
import { Hotel } from "../hotel/model.js";
import { ReviewReport } from "./report.js";

const recalcHotelRating = async (hotelId) => {
  const reviews = await Review.find({ hotelId });
  const count = reviews.length;
  const avg =
    count === 0
      ? 0
      : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count;

  const hotel = await Hotel.findById(hotelId);
  if (hotel) {
    hotel.ratingCount = count;
    hotel.ratingAverage = avg;
    await hotel.save();
  }
};

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
  if (reservation.hotelId.toString() !== hotelId.toString()) {
    const err = new Error("REVIEW_HOTEL_MISMATCH");
    err.statusCode = 400;
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
    await recalcHotelRating(hotelId);
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

export const updateReview = async (userId, reviewId, payload) => {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) {
    const err = new Error("REVIEW_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  if (payload.rating !== undefined) review.rating = payload.rating;
  if (payload.comment !== undefined) review.comment = payload.comment;
  if (payload.images !== undefined) review.images = payload.images;

  await review.save();
  await recalcHotelRating(review.hotelId);
  return review;
};

export const deleteReview = async (userId, reviewId) => {
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!review) {
    const err = new Error("REVIEW_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  await recalcHotelRating(review.hotelId);
  return true;
};

export const reportReview = async (userId, reviewId, reason) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("REVIEW_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  const payload = { reviewId, userId, reason };
  const report = await ReviewReport.findOneAndUpdate(
    { reviewId, userId },
    { $set: payload, status: "pending" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return report;
};

import mongoose from "mongoose";
import { Reservation } from "./model.js";
import { Payment } from "../payment/model.js";
import * as paymentService from "../payment/service.js";
import { Room } from "../room/model.js";
import * as couponService from "../coupon/service.js";

export const createReservation = async (userId, data) => {
  const { roomId, hotelId, guests, couponCode, checkIn, checkOut } = data;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const room = await Room.findById(roomId).populate("hotel").session(session);
    if (!room || room.status !== "active") {
      const err = new Error("ROOM_NOT_AVAILABLE");
      err.statusCode = 400;
      throw err;
    }

    const inventory = Number.isFinite(room.inventory) ? room.inventory : 1;
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights <= 0) {
      const err = new Error("INVALID_STAY_DATES");
      err.statusCode = 400;
      throw err;
    }

    const overlappingCount = await Reservation.countDocuments({
      roomId: room._id,
      status: { $nin: ["cancelled"] },
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    }).session(session);
    if (overlappingCount >= inventory) {
      const err = new Error("ROOM_FULLY_BOOKED");
      err.statusCode = 400;
      throw err;
    }

    if (guests && room.capacity < guests) {
      const err = new Error("ROOM_CAPACITY_EXCEEDED");
      err.statusCode = 400;
      throw err;
    }

    const targetHotelId = hotelId || room.hotel?._id || room.hotel;
    if (!targetHotelId) {
      const err = new Error("HOTEL_NOT_FOUND_FOR_ROOM");
      err.statusCode = 400;
      throw err;
    }

    if (hotelId && room.hotel && room.hotel._id.toString() !== hotelId.toString()) {
      const err = new Error("ROOM_NOT_IN_HOTEL");
      err.statusCode = 400;
      throw err;
    }

    const reservation = new Reservation({
      ...data,
      roomId: room._id,
      hotelId: targetHotelId,
      userId,
      basePrice: room.price * nights,
      discountAmount: 0,
      status: "pending",
    });

    if (couponCode) {
      const couponResult = await couponService.applyCouponForAmount(
        userId,
        couponCode,
        reservation.basePrice
      );
      reservation.couponId = couponResult.coupon._id;
      reservation.couponCode = couponResult.coupon.code;
      reservation.discountAmount = couponResult.discountAmount;
    }

    const finalPrice = Math.max(0, reservation.basePrice - reservation.discountAmount);
    reservation.totalPrice = finalPrice;

    await reservation.save({ session });
    await session.commitTransaction();
    return reservation;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getReservationDetail = async (id, userId) => {
  const reservation = await Reservation.findOne({ _id: id, userId })
    .populate("hotelId", "name address")
    .populate("roomId", "name type price")
    .populate("paymentId", "status amount");

  if (!reservation) {
    const err = new Error("RESERVATION_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  return reservation;
};

export const getReservationsByUser = async (userId) => {
  return await Reservation.find({ userId })
    .populate("hotelId", "name address")
    .populate("roomId", "name type")
    .sort({ createdAt: -1 });
};

export const cancelReservation = async (id, userId, cancelReason = "사용자 취소") => {
  const reservation = await Reservation.findOne({ _id: id, userId });
  if (!reservation) {
    const err = new Error("RESERVATION_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (reservation.status === "completed") {
    const err = new Error("RESERVATION_ALREADY_COMPLETED");
    err.statusCode = 400;
    throw err;
  }

  if (reservation.status === "cancelled") {
    return { reservation };
  }

  let paymentResult = null;
  if (reservation.paymentId) {
    const payment = await Payment.findById(reservation.paymentId);
    if (payment?.paymentKey && payment.status !== "CANCELLED") {
      paymentResult = await paymentService.cancelPayment(
        userId,
        { paymentKey: payment.paymentKey, cancelReason }
      );
      payment.status = "CANCELLED";
      payment.canceledAt = new Date();
      await payment.save();
    }
  }

  reservation.status = "cancelled";
  await reservation.save();

  if (reservation.couponId && reservation.couponUsed) {
    await couponService.revertCouponUsage(reservation.couponId, reservation.userId);
    reservation.couponUsed = false;
    await reservation.save();
  }

  return { reservation, payment: paymentResult };
};

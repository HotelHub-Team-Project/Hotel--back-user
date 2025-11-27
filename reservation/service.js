import { Reservation } from "./model.js";
import { Payment } from "../payment/model.js";
import * as paymentService from "../payment/service.js";
import { Room } from "../room/model.js";

export const createReservation = async (userId, data) => {
  const { roomId, hotelId, guests } = data;

  const room = await Room.findById(roomId).populate("hotel");
  if (!room || room.status !== "active") {
    const err = new Error("ROOM_NOT_AVAILABLE");
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
    status: "pending",
  });
  await reservation.save();
  return reservation;
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

  if (reservation.status === "cancelled") {
    return { reservation };
  }

  let paymentResult = null;
  if (reservation.paymentId) {
    const payment = await Payment.findById(reservation.paymentId);
    if (payment?.paymentKey && payment.status !== "CANCELLED") {
      paymentResult = await paymentService.cancelPayment(
        userId,
        payment.paymentKey,
        cancelReason
      );
      payment.status = "CANCELLED";
      payment.canceledAt = new Date();
      await payment.save();
    }
  }

  reservation.status = "cancelled";
  await reservation.save();

  return { reservation, payment: paymentResult };
};

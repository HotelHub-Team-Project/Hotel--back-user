import { Reservation } from "./model.js";
import { Payment } from "../payment/model.js";
import * as paymentService from "../payment/service.js";

export const createReservation = async (userId, data) => {
  const reservation = new Reservation({
    ...data,
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

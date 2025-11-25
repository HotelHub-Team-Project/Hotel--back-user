import axios from "axios";
import { Payment } from "./model.js";
import { Reservation } from "../reservation/model.js";

const getSecretKey = () => {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) {
    const err = new Error("TOSS_SECRET_KEY_NOT_SET");
    err.statusCode = 500;
    throw err;
  }
  return key;
};

export const confirmPayment = async (userId, paymentKey, orderId, amount) => {
  try {
    const widgetSecretKey = getSecretKey();
    const encryptedSecretKey =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    const response = await axios.post(
      "https://api.tosspayments.com/v1/payments/confirm",
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;
    const reservation = await Reservation.findById(orderId);
    if (!reservation) {
      const err = new Error("RESERVATION_NOT_FOUND");
      err.statusCode = 404;
      throw err;
    }

    if (reservation.userId.toString() !== userId.toString()) {
      const err = new Error("FORBIDDEN");
      err.statusCode = 403;
      throw err;
    }

    const payment = new Payment({
      reservationId: reservation._id,
      orderId: paymentData.orderId,
      paymentKey: paymentData.paymentKey,
      amount: paymentData.totalAmount,
      status: "PAID",
    });
    await payment.save();

    reservation.status = "confirmed";
    reservation.paymentId = payment._id;
    await reservation.save();

    return paymentData;
  } catch (error) {
    console.error("Toss Payment Error:", error.response?.data || error.message);
    const err = new Error(
      error.response?.data?.message || "PAYMENT_CONFIRM_FAILED"
    );
    err.statusCode = error.response?.status || error.statusCode || 500;
    throw err;
  }
};

export const cancelPayment = async (
  userId,
  paymentKey,
  cancelReason = "사용자 취소"
) => {
  try {
    const widgetSecretKey = getSecretKey();
    const encryptedSecretKey =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    // 사용자 소유권 검증
    const payment = await Payment.findOne({ paymentKey });
    if (!payment) {
      const err = new Error("PAYMENT_NOT_FOUND");
      err.statusCode = 404;
      throw err;
    }
    if (payment.reservationId) {
      const reservation = await Reservation.findById(payment.reservationId);
      if (reservation && reservation.userId.toString() !== userId.toString()) {
        const err = new Error("FORBIDDEN");
        err.statusCode = 403;
        throw err;
      }
    }

    const response = await axios.post(
      `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
      { cancelReason },
      {
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Toss Payment Cancel Error:",
      error.response?.data || error.message
    );
    const err = new Error(
      error.response?.data?.message || "PAYMENT_CANCEL_FAILED"
    );
    err.statusCode = error.response?.status || error.statusCode || 500;
    throw err;
  }
};

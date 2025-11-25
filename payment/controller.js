import * as paymentService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

export const confirmPayment = async (req, res) => {
  try {
    const { paymentKey, orderId, amount } = req.body;
    if (!paymentKey || !orderId || !amount) {
      return res
        .status(400)
        .json(errorResponse("PAYMENT_INFO_REQUIRED", 400));
    }

    const data = await paymentService.confirmPayment(
      paymentKey,
      orderId,
      amount
    );

    return res
      .status(200)
      .json(successResponse(data, "PAYMENT_CONFIRMED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json(errorResponse(err.message, err.statusCode || 500));
  }
};

export const cancelPayment = async (req, res) => {
  try {
    const { paymentKey, cancelReason } = req.body;
    if (!paymentKey) {
      return res.status(400).json(errorResponse("PAYMENT_KEY_REQUIRED", 400));
    }

    const data = await paymentService.cancelPayment(paymentKey, cancelReason);

    return res
      .status(200)
      .json(successResponse(data, "PAYMENT_CANCELLED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json(errorResponse(err.message, err.statusCode || 500));
  }
};

import Joi from "joi";
import * as paymentService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

const confirmSchema = Joi.object({
  paymentKey: Joi.string().required(),
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

const cancelSchema = Joi.object({
  paymentKey: Joi.string().required(),
  cancelReason: Joi.string().allow("", null),
});

export const confirmPayment = async (req, res) => {
  try {
    const { error } = confirmSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const { paymentKey, orderId, amount } = req.body;
    const data = await paymentService.confirmPayment(
      req.user._id,
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
    const { error } = cancelSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const { paymentKey, cancelReason } = req.body;
    const data = await paymentService.cancelPayment(
      req.user._id,
      paymentKey,
      cancelReason
    );

    return res
      .status(200)
      .json(successResponse(data, "PAYMENT_CANCELLED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json(errorResponse(err.message, err.statusCode || 500));
  }
};

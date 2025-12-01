import * as couponService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

const applySchema = Joi.object({
  code: Joi.string().trim().required(),
  amount: Joi.number().min(0).required(),
});

export const listAvailableCoupons = async (req, res) => {
  try {
    const data = await couponService.listAvailableCoupons(req.user._id);
    return res.status(200).json(successResponse(data, "COUPON_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { error } = applySchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const { code, amount } = req.body;
    const data = await couponService.applyCouponForAmount(req.user._id, code, amount);
    return res.status(200).json(successResponse(data, "COUPON_APPLIED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

import * as couponService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

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

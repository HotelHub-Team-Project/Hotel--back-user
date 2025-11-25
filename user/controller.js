import * as userService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

export const applyBusiness = async (req, res) => {
  try {
    const { businessName, businessNumber, bankAccount } = req.body;
    const data = await userService.applyBusiness(req.user._id, {
      businessName,
      businessNumber,
      bankAccount,
    });

    return res
      .status(200)
      .json(successResponse(data, "BUSINESS_APPLY_SUBMITTED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

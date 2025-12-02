import * as paymentMethodService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

const createSchema = Joi.object({
  cardNumber: Joi.string().min(12).max(30).required(),
  cardExpirationYear: Joi.string().min(2).max(4).required(),
  cardExpirationMonth: Joi.string().min(1).max(2).required(),
  cardHolder: Joi.string().optional(),
  nickname: Joi.string().optional(),
  cardBrand: Joi.string().optional(),
  country: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
});

export const createPaymentMethod = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const data = await paymentMethodService.addPaymentMethod(
      req.user._id,
      req.body
    );
    return res
      .status(201)
      .json(successResponse(data, "PAYMENT_METHOD_CREATED", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const listPaymentMethods = async (req, res) => {
  try {
    const data = await paymentMethodService.listPaymentMethods(req.user._id);
    return res
      .status(200)
      .json(successResponse(data, "PAYMENT_METHOD_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const data = await paymentMethodService.removePaymentMethod(
      req.user._id,
      req.params.id
    );
    return res
      .status(200)
      .json(successResponse(data, "PAYMENT_METHOD_DELETED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const setDefaultPaymentMethod = async (req, res) => {
  try {
    const data = await paymentMethodService.setDefaultPaymentMethod(
      req.user._id,
      req.params.id
    );
    return res
      .status(200)
      .json(successResponse(data, "PAYMENT_METHOD_SET_DEFAULT", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

import * as reservationService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

const createSchema = Joi.object({
  roomId: Joi.string().required(),
  hotelId: Joi.string().optional(), // backward compatibility if provided
  checkIn: Joi.date().required(),
  checkOut: Joi.date().required(),
  guests: Joi.number().integer().min(1).required(),
  couponCode: Joi.string().trim().optional(),
}).custom((value, helpers) => {
  if (value.checkIn && value.checkOut && value.checkOut <= value.checkIn) {
    return helpers.error("any.invalid", {
      message: "CHECK_OUT_MUST_BE_AFTER_CHECK_IN",
    });
  }
  return value;
}, "date range validation");

export const createReservation = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.roomId && payload.room) {
      payload.roomId = payload.room;
    }

    const { error } = createSchema.validate(payload);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const userId = req.user._id;
    const data = await reservationService.createReservation(userId, payload);
    return res
      .status(201)
      .json(successResponse(data, "RESERVATION_CREATED", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const getReservationDetail = async (req, res) => {
  try {
    const data = await reservationService.getReservationDetail(
      req.params.id,
      req.user._id
    );
    return res
      .status(200)
      .json(successResponse(data, "RESERVATION_DETAIL", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 404)
      .json(errorResponse(err.message, err.statusCode || 404));
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const data = await reservationService.getReservationsByUser(req.user._id);
    return res
      .status(200)
      .json(successResponse(data, "RESERVATION_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse("RESERVATION_FETCH_FAIL", err.statusCode || 400));
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const data = await reservationService.cancelReservation(
      req.params.id,
      req.user._id,
      req.body.cancelReason
    );
    return res
      .status(200)
      .json(successResponse(data, "RESERVATION_CANCELLED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

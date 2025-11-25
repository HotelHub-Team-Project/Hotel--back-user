import * as reservationService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

export const createReservation = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await reservationService.createReservation(userId, req.body);
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

import * as reviewService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

const createSchema = Joi.object({
  reservationId: Joi.string().required(),
  hotelId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().min(1).required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

export const createReview = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const data = await reviewService.createReview(req.user._id, req.body);
    return res.status(201).json(successResponse(data, "REVIEW_CREATED", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const getReviews = async (req, res) => {
  try {
    const data = await reviewService.getReviews(req.query.hotelId);
    return res.status(200).json(successResponse(data, "REVIEW_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

const updateSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().trim().min(1).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
}).min(1);

export const updateReview = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await reviewService.updateReview(
      req.user._id,
      req.params.id,
      req.body
    );
    return res.status(200).json(successResponse(data, "REVIEW_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const deleteReview = async (req, res) => {
  try {
    const data = await reviewService.deleteReview(req.user._id, req.params.id);
    return res.status(200).json(successResponse(data, "REVIEW_DELETED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

const reportSchema = Joi.object({
  reason: Joi.string().trim().min(3).required(),
});

export const reportReview = async (req, res) => {
  try {
    const { error } = reportSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await reviewService.reportReview(
      req.user._id,
      req.params.id,
      req.body.reason
    );
    return res.status(201).json(successResponse(data, "REVIEW_REPORTED", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

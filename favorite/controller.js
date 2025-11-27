import * as favoriteService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

const addSchema = Joi.object({
  hotelId: Joi.string().required(),
});

export const listFavorites = async (req, res) => {
  try {
    const data = await favoriteService.listFavorites(req.user._id);
    return res.status(200).json(successResponse(data, "FAVORITE_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { error } = addSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const { hotelId } = req.body;
    const data = await favoriteService.addFavorite(req.user._id, hotelId);
    return res.status(201).json(successResponse(data, "FAVORITE_ADDED", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const data = await favoriteService.removeFavorite(
      req.user._id,
      req.params.id
    );
    return res.status(200).json(successResponse(data, "FAVORITE_REMOVED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

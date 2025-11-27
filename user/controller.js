import * as userService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

const profileSchema = Joi.object({
  name: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  address: Joi.string().trim().optional(),
  dateOfBirth: Joi.date().optional(),
});

const passwordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).disallow(Joi.ref("currentPassword")).required(),
});

const imageSchema = Joi.object({
  avatarUrl: Joi.string().uri().optional(),
  coverUrl: Joi.string().uri().optional(),
}).or("avatarUrl", "coverUrl");

export const updateProfile = async (req, res) => {
  try {
    const { error } = profileSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const data = await userService.updateProfile(req.user._id, req.body);
    return res.status(200).json(successResponse(data, "PROFILE_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const changePassword = async (req, res) => {
  try {
    const { error } = passwordSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    await userService.changePassword(req.user._id, req.body);
    return res
      .status(200)
      .json(successResponse(null, "PASSWORD_CHANGED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const { error } = imageSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const data = await userService.updateProfileImage(req.user._id, req.body);
    return res
      .status(200)
      .json(successResponse(data, "PROFILE_IMAGE_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

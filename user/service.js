import { User } from "./model.js";

export const updateProfile = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const { name, phone, address, dateOfBirth } = payload;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

  await user.save();
  return user.toJSON();
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const err = new Error("INVALID_CREDENTIALS");
    err.statusCode = 401;
    throw err;
  }

  user.password = newPassword;
  await user.save();
  return true;
};

export const updateProfileImage = async (userId, { avatarUrl, coverUrl }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (coverUrl !== undefined) user.coverUrl = coverUrl;

  await user.save();
  return user.toJSON();
};

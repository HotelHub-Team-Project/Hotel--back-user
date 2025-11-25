import { User } from "./model.js";

export const applyBusiness = async (userId, businessInfo) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "owner") {
    const err = new Error("ALREADY_OWNER");
    err.statusCode = 400;
    throw err;
  }

  user.businessInfo = businessInfo;
  user.businessStatus = "pending";
  await user.save();

  return {
    email: user.email,
    businessStatus: user.businessStatus,
  };
};

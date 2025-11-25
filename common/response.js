export const successResponse = (data, message = "SUCCESS", resultCode = 200) => {
  return {
    data,
    message,
    resultCode,
  };
};

export const errorResponse = (message = "FAIL", resultCode = 400, data = null) => {
  return {
    data,
    message,
    resultCode,
  };
};

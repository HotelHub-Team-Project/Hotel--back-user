import { errorResponse } from "./response.js";

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const data =
    process.env.NODE_ENV === "development" ? { stack: err.stack } : null;

  console.error("❌ Error:", err.message);
  if (err.stack) console.error(err.stack);

  return res
    .status(statusCode)
    .json(errorResponse(err.message || "INTERNAL_SERVER_ERROR", statusCode, data));
};

export default errorHandler;

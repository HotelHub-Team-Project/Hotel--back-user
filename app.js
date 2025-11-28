import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import errorHandler from "./common/errorHandler.js";
import { successResponse } from "./common/response.js";

const app = express();

const allowedOrigins = (process.env.FRONT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, "")) // strip trailing slash to match browser origin exactly
  .filter(Boolean);

app.use(
  cors({
    origin: 'allowedOrigins',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use("/api", apiRoutes);

app.get("/health", (_req, res) => {
  res
    .status(200)
    .json(successResponse({ status: "ok" }, "Server is running!", 200));
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Server start failed:", err.message);
  process.exit(1);
});

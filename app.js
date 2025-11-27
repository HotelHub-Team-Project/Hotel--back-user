import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import errorHandler from "./common/errorHandler.js";
import { successResponse } from "./common/response.js";

const app = express();

// DB 연결
connectDB();

app.use(
  cors({
    origin: process.env.FRONT_ORIGIN || "http://localhost:5173",
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

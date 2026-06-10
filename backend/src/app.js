import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Enable CORS with specific origin and credentials
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middleware to parse JSON and URL-encoded data with a strict size limit
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Securely parse cookies
app.use(cookieParser());

// Import Routers
import authRouter from "./routes/auth.routes.js";

// Mount Routers
app.use("/api/v1/auth", authRouter);

// Base API Health Check
import { ApiResponse } from "./utils/ApiResponse.js";
app.get("/api/v1/health", (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "AssetTrack Pro API is running smoothly"));
});

// Centralized error fallback middleware to structure unhandled framework errors into uniform ApiErrors
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export { app };

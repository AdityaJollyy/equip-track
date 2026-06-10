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

// Example Health Check Route using our standard response
import { ApiResponse } from "./utils/ApiResponse.js";

app.get("/api/v1/health", (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "EquipTrack API is running smoothly"));
});

export { app };

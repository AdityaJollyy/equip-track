import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { query } from "../db/index.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extract token from HTTP-only cookies or Authorization header fallback
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request. Missing access token.");
    }

    // Verify token validity
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Pull user details from database without exposing password hash
    const adminResult = await query(
      "SELECT id, username, email FROM admins WHERE id = $1",
      [decodedToken.id]
    );

    const admin = adminResult.rows[0];

    if (!admin) {
      throw new ApiError(401, "Invalid Access Token. Admin user not found.");
    }

    // Attach verified admin details to the request lifecycle object
    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

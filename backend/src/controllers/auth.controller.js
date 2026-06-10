import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Cookie configurations adhering to security practices
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day matching token lifespan
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All registration fields are required.");
  }

  // Check if admin email or username already exists
  const existingAdmin = await query(
    "SELECT id FROM admins WHERE email = $1 OR username = $2",
    [email, username]
  );

  if (existingAdmin.rows.length > 0) {
    throw new ApiError(
      409,
      "Admin credentials already registered under this email or username."
    );
  }

  // Encrypt raw password string
  const passwordHash = await bcrypt.hash(password, 10);

  // Persist secure registration payload
  const newAdmin = await query(
    "INSERT INTO admins (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
    [username, email, passwordHash]
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newAdmin.rows[0],
        "Admin profile provisioned successfully."
      )
    );
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      400,
      "Email and password fields are strictly mandatory."
    );
  }

  // Fetch admin signature record
  const adminResult = await query("SELECT * FROM admins WHERE email = $1", [
    email,
  ]);
  const admin = adminResult.rows[0];

  if (!admin) {
    throw new ApiError(404, "Admin profile does not exist.");
  }

  // Evaluate password hash match
  const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials.");
  }

  // Sign JWT core access token
  const accessToken = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );

  // Clean password property out of local variable reference scope
  delete admin.password_hash;

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { admin, accessToken },
        "Session authenticated successfully."
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(
      new ApiResponse(
        200,
        {},
        "Session invalidated and logged out successfully."
      )
    );
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.admin, "Active authorization context retrieved.")
    );
});

export { registerAdmin, loginAdmin, logoutAdmin, getCurrentAdmin };

import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Publicly exposed endpoints
router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);

// Secured endpoints requiring active JWT contexts
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/me").get(verifyJWT, getCurrentAdmin);

export default router;

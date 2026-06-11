import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  assignAsset,
  returnAsset,
  getAssignments,
} from "../controllers/assignment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAssignments).post(assignAsset);
router.route("/:id/return").post(returnAsset);

export default router;

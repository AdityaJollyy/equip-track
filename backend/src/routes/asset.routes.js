import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAssetModels,
  addAssetModel,
  createSingleAsset,
  createBulkAssets,
  getAssets,
} from "../controllers/asset.controller.js";

const router = Router();

// Apply JWT verification to all routes in this file
router.use(verifyJWT);

// Catalog / Model Routes
router.route("/models").get(getAssetModels).post(addAssetModel);

// Inventory / Physical Asset Routes
router.route("/").get(getAssets);
router.route("/single").post(createSingleAsset);
router.route("/bulk").post(createBulkAssets);

export default router;

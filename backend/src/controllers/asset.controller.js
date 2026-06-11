import { pool, query } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper: Determine prefix based on asset type
const getAssetPrefix = (assetType) => {
  const map = {
    "Mobile Phone": "PHN",
    Laptop: "LAP",
    Tablet: "TAB",
    Monitor: "MON",
    Printer: "PRN",
    Router: "RTR",
  };
  return map[assetType] || "AST";
};

// Helper: Generate next asset tag (e.g., PHN-001)
const generateNextAssetTag = async (client, assetType) => {
  const prefix = getAssetPrefix(assetType);
  const result = await client.query(
    `SELECT asset_tag FROM assets WHERE asset_tag LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}-%`]
  );

  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastTag = result.rows[0].asset_tag;
    const lastNum = parseInt(lastTag.split("-")[1], 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }
  return `${prefix}-${nextNum.toString().padStart(3, "0")}`;
};

// @desc    Get all asset models (Catalog)
// @route   GET /api/v1/assets/models
export const getAssetModels = asyncHandler(async (req, res) => {
  const models = await query(
    "SELECT * FROM asset_models ORDER BY brand, model_name"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, models.rows, "Asset models retrieved."));
});

// @desc    Add a new asset model
// @route   POST /api/v1/assets/models
export const addAssetModel = asyncHandler(async (req, res) => {
  const { asset_type, brand, model_name } = req.body;

  if (!asset_type || !brand || !model_name) {
    throw new ApiError(400, "Asset Type, Brand, and Model Name are required.");
  }

  try {
    const newModel = await query(
      `INSERT INTO asset_models (asset_type, brand, model_name) VALUES ($1, $2, $3) RETURNING *`,
      [asset_type, brand, model_name]
    );
    return res
      .status(201)
      .json(new ApiResponse(201, newModel.rows[0], "Asset model created."));
  } catch (error) {
    if (error.code === "23505")
      throw new ApiError(409, "This asset model already exists.");
    throw error;
  }
});

// @desc    Validation Helper for individual devices
const validateDeviceLogic = (assetType, device) => {
  if (!device.serial_number) {
    throw new ApiError(400, "Serial Number is mandatory for all assets.");
  }

  if (assetType === "Mobile Phone" && !device.imei_number) {
    throw new ApiError(400, "IMEI Number is mandatory for Mobile Phones.");
  }

  if (assetType === "Tablet") {
    if (device.supports_sim === undefined || device.supports_sim === null) {
      throw new ApiError(400, "Must specify if Tablet supports SIM.");
    }
    if (device.supports_sim && !device.imei_number) {
      throw new ApiError(
        400,
        "IMEI Number is mandatory for SIM-enabled tablets."
      );
    }
    if (!device.supports_sim) {
      device.imei_number = null; // Ensure no IMEI is saved if not SIM enabled
    }
  }
};

// @desc    Add a single physical asset
// @route   POST /api/v1/assets/single
export const createSingleAsset = asyncHandler(async (req, res) => {
  const {
    model_id,
    serial_number,
    supports_sim,
    imei_number,
    purchase_date,
    vendor,
    invoice_number,
  } = req.body;

  // Verify model exists to enforce logic
  const modelCheck = await query(
    "SELECT asset_type FROM asset_models WHERE id = $1",
    [model_id]
  );
  if (modelCheck.rows.length === 0)
    throw new ApiError(404, "Asset Model not found.");

  const assetType = modelCheck.rows[0].asset_type;

  // Apply Business Rules
  const deviceData = { serial_number, supports_sim, imei_number };
  validateDeviceLogic(assetType, deviceData);

  // We use a transaction to safely generate the tag and insert
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const assetTag = await generateNextAssetTag(client, assetType);

    const newAsset = await client.query(
      `INSERT INTO assets 
      (asset_tag, model_id, serial_number, supports_sim, imei_number, purchase_date, vendor, invoice_number) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        assetTag,
        model_id,
        serial_number,
        deviceData.supports_sim || false,
        deviceData.imei_number,
        purchase_date,
        vendor,
        invoice_number,
      ]
    );

    await client.query("COMMIT");
    return res
      .status(201)
      .json(
        new ApiResponse(201, newAsset.rows[0], "Asset created successfully.")
      );
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505")
      throw new ApiError(
        409,
        "Serial Number or IMEI already exists in the system."
      );
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Add multiple physical assets (Bulk Procurement)
// @route   POST /api/v1/assets/bulk
export const createBulkAssets = asyncHandler(async (req, res) => {
  const { model_id, purchase_date, vendor, invoice_number, devices } = req.body;

  if (!Array.isArray(devices) || devices.length === 0) {
    throw new ApiError(400, "Devices array is required for bulk creation.");
  }

  const modelCheck = await query(
    "SELECT asset_type FROM asset_models WHERE id = $1",
    [model_id]
  );
  if (modelCheck.rows.length === 0)
    throw new ApiError(404, "Asset Model not found.");

  const assetType = modelCheck.rows[0].asset_type;

  // Validate all devices BEFORE opening a transaction
  devices.forEach((device) => validateDeviceLogic(assetType, device));

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const createdAssets = [];

    // Process sequentially to ensure asset tags generate correctly (PHN-001, PHN-002, etc.)
    for (const device of devices) {
      const assetTag = await generateNextAssetTag(client, assetType);

      const newAsset = await client.query(
        `INSERT INTO assets 
        (asset_tag, model_id, serial_number, supports_sim, imei_number, purchase_date, vendor, invoice_number) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          assetTag,
          model_id,
          device.serial_number,
          device.supports_sim || false,
          device.imei_number,
          purchase_date,
          vendor,
          invoice_number,
        ]
      );
      createdAssets.push(newAsset.rows[0]);
    }

    await client.query("COMMIT");
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { count: createdAssets.length, assets: createdAssets },
          "Bulk assets created successfully."
        )
      );
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505")
      throw new ApiError(
        409,
        "Duplicate Serial Number or IMEI detected in batch."
      );
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Get all assets with model details
// @route   GET /api/v1/assets
export const getAssets = asyncHandler(async (req, res) => {
  // Join assets with asset_models to get full details
  const sql = `
    SELECT a.*, am.asset_type, am.brand, am.model_name 
    FROM assets a
    JOIN asset_models am ON a.model_id = am.id
    ORDER BY a.created_at DESC
  `;
  const assetsResult = await query(sql);

  return res
    .status(200)
    .json(new ApiResponse(200, assetsResult.rows, "Assets retrieved."));
});

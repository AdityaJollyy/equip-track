import { pool, query } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Assign an asset to an employee
// @route   POST /api/v1/assignments
export const assignAsset = asyncHandler(async (req, res) => {
  const { asset_id, employee_id, remarks } = req.body;

  if (!asset_id || !employee_id) {
    throw new ApiError(400, "Asset ID and Employee ID are required.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Verify asset exists and is available
    const assetCheck = await client.query(
      "SELECT status FROM assets WHERE id = $1 FOR UPDATE",
      [asset_id]
    );
    if (assetCheck.rows.length === 0)
      throw new ApiError(404, "Asset not found.");
    if (assetCheck.rows[0].status !== "In Stock")
      throw new ApiError(400, "Asset is not currently 'In Stock'.");

    // 2. Create Assignment Record
    const newAssignment = await client.query(
      `INSERT INTO assignments (asset_id, employee_id, assigned_by, remarks, status) 
       VALUES ($1, $2, $3, $4, 'Active') RETURNING *`,
      [asset_id, employee_id, req.admin.id, remarks]
    );

    // 3. Update Asset Status
    await client.query("UPDATE assets SET status = 'Assigned' WHERE id = $1", [
      asset_id,
    ]);

    await client.query("COMMIT");
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          newAssignment.rows[0],
          "Asset assigned successfully."
        )
      );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Return an assigned asset
// @route   POST /api/v1/assignments/:id/return
export const returnAsset = asyncHandler(async (req, res) => {
  const { id } = req.params; // Assignment ID
  const { device_condition, remarks } = req.body;

  if (!device_condition) {
    throw new ApiError(400, "Device condition is required for returns.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get active assignment
    const assignCheck = await client.query(
      "SELECT asset_id, status FROM assignments WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (assignCheck.rows.length === 0)
      throw new ApiError(404, "Assignment record not found.");
    if (assignCheck.rows[0].status !== "Active")
      throw new ApiError(400, "This asset has already been returned.");

    const assetId = assignCheck.rows[0].asset_id;

    // 2. Update Assignment Record
    const returnedAssignment = await client.query(
      `UPDATE assignments 
       SET return_date = CURRENT_TIMESTAMP, device_condition = $1, remarks = CONCAT(remarks, ' | Return Note: ', $2::text), status = 'Returned' 
       WHERE id = $3 RETURNING *`,
      [device_condition, remarks || "", id]
    );

    // 3. Update Asset Status
    await client.query("UPDATE assets SET status = 'In Stock' WHERE id = $1", [
      assetId,
    ]);

    await client.query("COMMIT");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          returnedAssignment.rows[0],
          "Asset returned successfully."
        )
      );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Get all assignments (History & Active)
// @route   GET /api/v1/assignments
export const getAssignments = asyncHandler(async (req, res) => {
  const sql = `
    SELECT 
      assign.id, assign.assignment_date, assign.return_date, assign.device_condition, assign.remarks, assign.status,
      a.asset_tag, a.serial_number, am.brand, am.model_name,
      e.name as employee_name, e.employee_id, e.department,
      ad.username as assigned_by_name
    FROM assignments assign
    JOIN assets a ON assign.asset_id = a.id
    JOIN asset_models am ON a.model_id = am.id
    JOIN employees e ON assign.employee_id = e.id
    LEFT JOIN admins ad ON assign.assigned_by = ad.id
    ORDER BY assign.assignment_date DESC
  `;
  const result = await query(sql);
  return res
    .status(200)
    .json(new ApiResponse(200, result.rows, "Assignment history retrieved."));
});

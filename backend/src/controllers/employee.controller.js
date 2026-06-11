import { query } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Add a new employee
// @route   POST /api/v1/employees
const addEmployee = asyncHandler(async (req, res) => {
  const { employee_id, name, department, designation, email, phone } = req.body;

  // Validate mandatory fields
  if (
    [employee_id, name, email].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(
      400,
      "Employee ID, Name, and Email are strictly required."
    );
  }

  // Check for duplicate employee_id or email
  const existingEmployeeCheck = await query(
    "SELECT id FROM employees WHERE employee_id = $1 OR email = $2",
    [employee_id, email]
  );

  if (existingEmployeeCheck.rows.length > 0) {
    throw new ApiError(
      409,
      "An employee with this ID or Email already exists."
    );
  }

  // Insert new employee
  const newEmployee = await query(
    `INSERT INTO employees (employee_id, name, department, designation, email, phone) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [employee_id, name, department, designation, email, phone]
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, newEmployee.rows[0], "Employee added successfully.")
    );
});

// @desc    Get all employees (with optional search)
// @route   GET /api/v1/employees
const getEmployees = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let sqlQuery = "SELECT * FROM employees";
  let queryParams = [];

  // Implement search functionality using ILIKE for case-insensitive matching
  if (search) {
    sqlQuery += ` WHERE name ILIKE $1 OR employee_id ILIKE $1 OR email ILIKE $1 OR department ILIKE $1`;
    queryParams.push(`%${search}%`);
  }

  sqlQuery += " ORDER BY created_at DESC";

  const employees = await query(sqlQuery, queryParams);

  return res
    .status(200)
    .json(
      new ApiResponse(200, employees.rows, "Employees retrieved successfully.")
    );
});

// @desc    Get a single employee by database ID
// @route   GET /api/v1/employees/:id
const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employeeResult = await query("SELECT * FROM employees WHERE id = $1", [
    id,
  ]);

  if (employeeResult.rows.length === 0) {
    throw new ApiError(404, "Employee not found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        employeeResult.rows[0],
        "Employee retrieved successfully."
      )
    );
});

// @desc    Update employee details
// @route   PUT /api/v1/employees/:id
const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, department, designation, phone } = req.body;

  // We restrict updating employee_id and email here to prevent database constraint conflicts
  // and maintain data integrity. They act as permanent identifiers.
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Employee Name is required for update.");
  }

  const updatedEmployee = await query(
    `UPDATE employees 
     SET name = $1, department = $2, designation = $3, phone = $4 
     WHERE id = $5 
     RETURNING *`,
    [name, department, designation, phone, id]
  );

  if (updatedEmployee.rows.length === 0) {
    throw new ApiError(404, "Employee not found to update.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedEmployee.rows[0],
        "Employee details updated successfully."
      )
    );
});

// @desc    Delete an employee
// @route   DELETE /api/v1/employees/:id
const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedEmployee = await query(
    "DELETE FROM employees WHERE id = $1 RETURNING id",
    [id]
  );

  if (deletedEmployee.rows.length === 0) {
    throw new ApiError(404, "Employee not found to delete.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Employee deleted successfully."));
});

export {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};

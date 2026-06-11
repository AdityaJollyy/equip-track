import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";

const router = Router();

// Apply JWT verification to all routes in this file
router.use(verifyJWT);

// Root routes: /api/v1/employees
router.route("/").get(getEmployees).post(addEmployee);

// ID-specific routes: /api/v1/employees/:id
router
  .route("/:id")
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

export default router;

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmployeeModal } from "../components/employees/EmployeeModal";
import api from "../api/axios";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Wrapped in useCallback to prevent infinite re-renders
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees?search=${search}`);
      setEmployees(res.data.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // 2. Safely added fetchEmployees to the dependency array
  useEffect(() => {
    const timeoutId = setTimeout(() => fetchEmployees(), 500);
    return () => clearTimeout(timeoutId);
  }, [fetchEmployees]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error("Failed to delete employee", error);
      alert("Failed to delete employee");
    }
  };

  const openAddModal = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-zinc-50">Employees</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your organization's staff
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="flex items-center rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Search className="h-5 w-5 text-zinc-400" />
        <Input
          placeholder="Search by name, email, or ID..."
          className="border-0 ring-offset-transparent focus-visible:ring-0 dark:bg-zinc-950"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Employee ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-zinc-500">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                      {emp.employee_id}
                    </td>
                    <td className="px-6 py-4">{emp.name}</td>
                    <td className="px-6 py-4 text-zinc-500">{emp.email}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {emp.department || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="mr-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Conditionally rendering Modal with a unique key safely clears and resets its state */}
      {isModalOpen && (
        <EmployeeModal
          key={employeeToEdit ? employeeToEdit.id : "new-employee"}
          onClose={() => setIsModalOpen(false)}
          employeeToEdit={employeeToEdit}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  );
}

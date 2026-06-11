import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import api from "../../api/axios";

export function EmployeeModal({ onClose, employeeToEdit, onSuccess }) {
  // Initialize state directly from the prop. No useEffect needed!
  const [formData, setFormData] = useState({
    employee_id: employeeToEdit?.employee_id || "",
    name: employeeToEdit?.name || "",
    department: employeeToEdit?.department || "",
    designation: employeeToEdit?.designation || "",
    email: employeeToEdit?.email || "",
    phone: employeeToEdit?.phone || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (employeeToEdit) {
        await api.put(`/employees/${employeeToEdit.id}`, formData);
      } else {
        await api.post("/employees", formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-zinc-50">
            {employeeToEdit ? "Edit Employee" : "Add Employee"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Employee ID (e.g., EMP-001)"
            value={formData.employee_id}
            onChange={(e) =>
              setFormData({ ...formData, employee_id: e.target.value })
            }
            disabled={!!employeeToEdit}
            required
          />
          <Input
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={!!employeeToEdit}
            required
          />
          <Input
            placeholder="Department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          />
          <Input
            placeholder="Designation"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
          />
          <Input
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

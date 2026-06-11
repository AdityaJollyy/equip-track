import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import api from "../../api/axios";

export function AssignModal({ onClose, onSuccess }) {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    asset_id: "",
    employee_id: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch only available assets and all employees
    Promise.all([api.get("/assets"), api.get("/employees")]).then(
      ([assetsRes, empRes]) => {
        setAssets(assetsRes.data.data.filter((a) => a.status === "In Stock"));
        setEmployees(empRes.data.data);
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/assignments", formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-zinc-50">
            Assign Asset
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            value={formData.asset_id}
            onChange={(e) =>
              setFormData({ ...formData, asset_id: e.target.value })
            }
            required
          >
            <option value="" disabled>
              Select an available asset
            </option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.asset_tag} - {a.brand} {a.model_name}
              </option>
            ))}
          </select>

          <select
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            value={formData.employee_id}
            onChange={(e) =>
              setFormData({ ...formData, employee_id: e.target.value })
            }
            required
          >
            <option value="" disabled>
              Select an employee
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.employee_id})
              </option>
            ))}
          </select>

          <Input
            placeholder="Remarks (Optional)"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Assign Device
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

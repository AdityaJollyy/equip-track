import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import api from "../../api/axios";

export function ReturnModal({ assignment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    device_condition: "Good",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conditions = ["Excellent", "Good", "Fair", "Damaged", "Lost"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/assignments/${assignment.id}/return`, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Return failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-zinc-50">
            Process Return
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-950/50 dark:text-zinc-300">
          <p>
            <strong>Asset:</strong> {assignment.asset_tag} ({assignment.brand}{" "}
            {assignment.model_name})
          </p>
          <p>
            <strong>Returning From:</strong> {assignment.employee_name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            value={formData.device_condition}
            onChange={(e) =>
              setFormData({ ...formData, device_condition: e.target.value })
            }
            required
          >
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <Input
            placeholder="Return Remarks (Optional)"
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
              Confirm Return
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

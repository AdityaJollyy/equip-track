import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import api from "../../api/axios";

const ASSET_TYPES = [
  "Mobile Phone",
  "Laptop",
  "Tablet",
  "Monitor",
  "Printer",
  "Router",
  "Other",
];

export function ModelModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    asset_type: ASSET_TYPES[0],
    brand: "",
    model_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/assets/models", formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create model");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-zinc-50">
            Add Asset Model
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Asset Type
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-zinc-300"
              value={formData.asset_type}
              onChange={(e) =>
                setFormData({ ...formData, asset_type: e.target.value })
              }
            >
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <Input
            placeholder="Brand (e.g., Dell, Apple)"
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
            required
          />
          <Input
            placeholder="Model Name (e.g., Latitude 7420)"
            value={formData.model_name}
            onChange={(e) =>
              setFormData({ ...formData, model_name: e.target.value })
            }
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Model
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

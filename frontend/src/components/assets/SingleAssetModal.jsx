import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import api from "../../api/axios";

export function SingleAssetModal({ onClose, onSuccess, models }) {
  const [formData, setFormData] = useState({
    model_id: models[0]?.id || "",
    serial_number: "",
    supports_sim: false,
    imei_number: "",
    purchase_date: "",
    vendor: "",
    invoice_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine rules based on selected model
  const selectedModel = useMemo(
    () => models.find((m) => m.id === parseInt(formData.model_id)),
    [formData.model_id, models]
  );
  const isPhone = selectedModel?.asset_type === "Mobile Phone";
  const isTablet = selectedModel?.asset_type === "Tablet";
  const needsImei = isPhone || (isTablet && formData.supports_sim);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/assets/single", formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-zinc-50">
            Add Single Asset
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            value={formData.model_id}
            onChange={(e) =>
              setFormData({ ...formData, model_id: e.target.value })
            }
            required
          >
            <option value="" disabled>
              Select Asset Model
            </option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand} {m.model_name} ({m.asset_type})
              </option>
            ))}
          </select>

          <Input
            placeholder="Serial Number (Mandatory)"
            value={formData.serial_number}
            onChange={(e) =>
              setFormData({ ...formData, serial_number: e.target.value })
            }
            required
          />

          {isTablet && (
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={formData.supports_sim}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supports_sim: e.target.checked,
                    imei_number: "",
                  })
                }
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-zinc-50"
              />
              This tablet supports a SIM card
            </label>
          )}

          {needsImei && (
            <Input
              placeholder="IMEI Number (Mandatory)"
              value={formData.imei_number}
              onChange={(e) =>
                setFormData({ ...formData, imei_number: e.target.value })
              }
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={formData.purchase_date}
              onChange={(e) =>
                setFormData({ ...formData, purchase_date: e.target.value })
              }
            />
            <Input
              placeholder="Vendor"
              value={formData.vendor}
              onChange={(e) =>
                setFormData({ ...formData, vendor: e.target.value })
              }
            />
          </div>
          <Input
            placeholder="Invoice Number"
            value={formData.invoice_number}
            onChange={(e) =>
              setFormData({ ...formData, invoice_number: e.target.value })
            }
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Asset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import api from "../../api/axios";

export function BulkAssetModal({ onClose, onSuccess, models }) {
  const [modelId, setModelId] = useState(models[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [devices, setDevices] = useState([
    { serial_number: "", imei_number: "", supports_sim: false },
  ]);
  const [commonData, setCommonData] = useState({
    purchase_date: "",
    vendor: "",
    invoice_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedModel = useMemo(
    () => models.find((m) => m.id === parseInt(modelId)),
    [modelId, models]
  );
  const isPhone = selectedModel?.asset_type === "Mobile Phone";
  const isTablet = selectedModel?.asset_type === "Tablet";

  // Adjust array size when quantity changes
  useEffect(() => {
    const q = parseInt(quantity) || 1;
    setDevices((prev) => {
      const newDevices = [...prev];
      if (q > prev.length) {
        for (let i = prev.length; i < q; i++)
          newDevices.push({
            serial_number: "",
            imei_number: "",
            supports_sim: false,
          });
      } else if (q < prev.length) {
        newDevices.splice(q);
      }
      return newDevices;
    });
  }, [quantity]);

  const updateDevice = (index, field, value) => {
    const newDevices = [...devices];
    newDevices[index][field] = value;
    setDevices(newDevices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/assets/bulk", {
        model_id: modelId,
        ...commonData,
        devices,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bulk assets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-xl bg-white shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="flex items-center justify-between border-b p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold dark:text-zinc-50">
            Bulk Asset Procurement
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="bulk-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                required
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} {m.model_name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min="1"
                max="50"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4 border-b pb-4 dark:border-zinc-800">
              <Input
                type="date"
                value={commonData.purchase_date}
                onChange={(e) =>
                  setCommonData({
                    ...commonData,
                    purchase_date: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Vendor"
                value={commonData.vendor}
                onChange={(e) =>
                  setCommonData({ ...commonData, vendor: e.target.value })
                }
              />
              <Input
                placeholder="Invoice Number"
                value={commonData.invoice_number}
                onChange={(e) =>
                  setCommonData({
                    ...commonData,
                    invoice_number: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Enter Individual Identifiers
              </h3>
              {devices.map((device, idx) => {
                const needsImei = isPhone || (isTablet && device.supports_sim);
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950/50"
                  >
                    <span className="text-xs font-semibold text-zinc-500">
                      Device #{idx + 1}
                    </span>
                    <div className="flex gap-4 items-start">
                      <Input
                        placeholder="Serial Number"
                        value={device.serial_number}
                        onChange={(e) =>
                          updateDevice(idx, "serial_number", e.target.value)
                        }
                        required
                      />

                      {isTablet && (
                        <div className="flex items-center h-10 px-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={device.supports_sim}
                              onChange={(e) => {
                                updateDevice(
                                  idx,
                                  "supports_sim",
                                  e.target.checked
                                );
                                updateDevice(idx, "imei_number", "");
                              }}
                              className="rounded border-zinc-300"
                            />
                            SIM?
                          </label>
                        </div>
                      )}

                      {needsImei && (
                        <Input
                          placeholder="IMEI Number"
                          value={device.imei_number}
                          onChange={(e) =>
                            updateDevice(idx, "imei_number", e.target.value)
                          }
                          required
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </form>
        </div>

        <div className="flex justify-between border-t p-6 dark:border-zinc-800">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="bulk-form" isLoading={loading}>
              Create {quantity} Assets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

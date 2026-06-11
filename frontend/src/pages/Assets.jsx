import { useState, useEffect, useCallback } from "react";
import { Plus, CopyPlus, Layers } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ModelModal } from "../components/assets/ModelModal";
import { SingleAssetModal } from "../components/assets/SingleAssetModal";
import { BulkAssetModal } from "../components/assets/BulkAssetModal";
import api from "../api/axios";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetsRes, modelsRes] = await Promise.all([
        api.get("/assets"),
        api.get("/assets/models"),
      ]);
      setAssets(assetsRes.data.data);
      setModels(modelsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch asset data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAssetModal = (type) => {
    if (models.length === 0) {
      alert("Please create an Asset Model first.");
      return setIsModelModalOpen(true);
    }
    type === "single" ? setIsSingleModalOpen(true) : setIsBulkModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-zinc-50">
            Asset Inventory
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage organizational IT equipment
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsModelModalOpen(true)}>
            <Layers className="mr-2 h-4 w-4" /> Add Model
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenAssetModal("single")}
          >
            <Plus className="mr-2 h-4 w-4" /> Single Asset
          </Button>
          <Button onClick={() => handleOpenAssetModal("bulk")}>
            <CopyPlus className="mr-2 h-4 w-4" /> Bulk Procurement
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Asset ID</th>
                <th className="px-6 py-4 font-medium">Device Info</th>
                <th className="px-6 py-4 font-medium">Serial Number</th>
                <th className="px-6 py-4 font-medium">IMEI</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-zinc-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-zinc-500">
                    No assets found.
                  </td>
                </tr>
              ) : (
                assets.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                      {item.asset_tag}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {item.brand} {item.model_name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.asset_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                      {item.serial_number}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                      {item.imei_number || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModelModalOpen && (
        <ModelModal
          onClose={() => setIsModelModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
      {isSingleModalOpen && (
        <SingleAssetModal
          models={models}
          onClose={() => setIsSingleModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
      {isBulkModalOpen && (
        <BulkAssetModal
          models={models}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

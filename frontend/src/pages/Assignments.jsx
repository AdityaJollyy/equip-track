import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, Undo2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { AssignModal } from "../components/assignments/AssignModal";
import { ReturnModal } from "../components/assignments/ReturnModal";
import api from "../api/axios";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [returnAssignment, setReturnAssignment] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/assignments");
      setAssignments(res.data.data);
    } catch (error) {
      console.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-zinc-50">
            Assignment History
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track asset check-outs and returns
          </p>
        </div>
        <Button onClick={() => setIsAssignOpen(true)}>
          <ArrowLeftRight className="mr-2 h-4 w-4" /> New Assignment
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Asset</th>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Date Assigned</th>
                <th className="px-6 py-4 font-medium">Status / Return Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-zinc-500">
                    Loading records...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-zinc-500">
                    No assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {record.asset_tag}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {record.brand} {record.model_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-900 dark:text-zinc-50">
                        {record.employee_name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {record.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {formatDate(record.assignment_date)}
                    </td>
                    <td className="px-6 py-4">
                      {record.status === "Active" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400">
                          Active
                        </span>
                      ) : (
                        <div className="text-zinc-600 dark:text-zinc-400">
                          Returned on {formatDate(record.return_date)}
                          <br />
                          <span className="text-xs text-zinc-500">
                            Cond: {record.device_condition}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {record.status === "Active" && (
                        <Button
                          variant="outline"
                          onClick={() => setReturnAssignment(record)}
                          className="h-8 px-2 text-xs"
                        >
                          <Undo2 className="mr-1 h-3 w-3" /> Return
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAssignOpen && (
        <AssignModal
          onClose={() => setIsAssignOpen(false)}
          onSuccess={fetchAssignments}
        />
      )}
      {returnAssignment && (
        <ReturnModal
          assignment={returnAssignment}
          onClose={() => setReturnAssignment(null)}
          onSuccess={fetchAssignments}
          key={returnAssignment.id}
        />
      )}
    </div>
  );
}

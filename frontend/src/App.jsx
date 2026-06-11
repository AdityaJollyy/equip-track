import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Employees from "./pages/Employees";

const DashboardPlaceholder = () => (
  <div className="dark:text-zinc-50">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p className="mt-2 text-zinc-500">
      Welcome to AssetTrack Pro. Statistics will appear here.
    </p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* DashboardLayout wraps all protected pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/employees" element={<Employees />} />
          {/* Future Routes: /assets, /assignments */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Assets from "./pages/Assets";
import Assignments from "./pages/Assignments";

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
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assignments" element={<Assignments />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

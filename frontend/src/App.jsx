import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";

// Temporary Dashboard placeholder for successful login routing
const Dashboard = () => (
  <div className="flex min-h-screen items-center justify-center dark:bg-zinc-950 dark:text-white">
    <h1 className="text-2xl font-bold">Dashboard (Protected)</h1>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* All protected routes go inside this wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        {/* We will add Employees, Assets, and Assignments routes here later */}
      </Route>
    </Routes>
  );
}

export default App;

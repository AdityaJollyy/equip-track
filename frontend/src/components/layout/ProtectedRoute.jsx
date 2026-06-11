import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent dark:border-zinc-50 dark:border-t-transparent" />
      </div>
    );
  }

  // If no active admin session, redirect to login
  return admin ? <Outlet /> : <Navigate to="/login" replace />;
}

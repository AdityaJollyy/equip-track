import { Outlet, Link, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { useState } from "react";

export function DashboardLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Assets", href: "/assets", icon: Package },
    { name: "Assignments", href: "/assignments", icon: ArrowLeftRight },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 font-bold text-zinc-900 dark:text-zinc-50">
            AssetTrack Pro
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-4 px-3 text-sm text-zinc-500 dark:text-zinc-400">
              Logged in as <br />
              <strong className="text-zinc-900 dark:text-zinc-50">
                {admin?.username}
              </strong>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-500/10"
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <Button
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarOff,
  Banknote,
  FileBarChart,
  Bell,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const employeeLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarDays },
  { name: "Leave & Time Off", href: "/dashboard/leaves", icon: CalendarOff },
  { name: "Payroll", href: "/dashboard/payroll", icon: Banknote },
];

const adminLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarDays },
  { name: "Leave Approvals", href: "/dashboard/leaves", icon: CalendarOff },
  { name: "Payroll", href: "/dashboard/payroll", icon: Banknote },
  { name: "Reports", href: "/dashboard/reports", icon: FileBarChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const links = profile?.role === "admin" ? adminLinks : employeeLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-950 border-r border-zinc-800 text-zinc-300">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Day<span className="text-purple-500">flow</span>
        </h1>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-600/10 text-purple-400 border border-purple-600/20"
                  : "hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800 space-y-1">
        <Link
          href="/dashboard/notifications"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/notifications"
              ? "bg-purple-600/10 text-purple-400 border border-purple-600/20"
              : "hover:bg-zinc-900 hover:text-white"
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-900 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

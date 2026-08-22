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
    <div className="flex h-full w-64 flex-col bg-card border-r border-border text-foreground transition-colors duration-200">
      <div className="flex h-16 items-center px-5 border-b border-border gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20">
          D
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-purple-600/15 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground")} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/dashboard/notifications"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/notifications"
              ? "bg-purple-600/15 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

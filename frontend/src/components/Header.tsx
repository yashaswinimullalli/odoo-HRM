"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      if (profile) {
        try {
          const res = await api.getMyNotifications();
          setUnreadCount(res.unreadCount || 0);
        } catch {
          // ignore
        }
      }
    }
    fetchUnread();
  }, [profile]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6 transition-colors duration-200">
      <div />
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent/40"
          title="View Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Link */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 pl-2 border-l border-border hover:opacity-85 transition-opacity"
          title="View My Profile"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none text-foreground">
              {profile?.fullName || "Loading..."}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{profile?.role}</p>
          </div>
          <Avatar className="h-8 w-8 border border-border bg-muted">
            <AvatarImage src={profile?.profilePicture} alt={profile?.fullName} />
            <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
              {getInitials(profile?.fullName)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}

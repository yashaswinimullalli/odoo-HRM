"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/lib/mockStore";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setUnreadCount(getUnreadCount(profile.uid));
    }
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
        <Link href="/dashboard/notifications" className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent/40">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute 1 top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none text-foreground">
              {profile?.fullName || "Loading..."}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{profile?.role}</p>
          </div>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={profile?.profilePicture} alt={profile?.fullName} />
            <AvatarFallback className="bg-muted text-xs text-foreground">
              {getInitials(profile?.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

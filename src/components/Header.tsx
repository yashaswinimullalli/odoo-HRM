"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/lib/mockStore";

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
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <div />
      <div className="flex items-center gap-6">
        <Link href="/dashboard/notifications" className="relative text-zinc-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none text-white">
              {profile?.fullName || "Loading..."}
            </p>
            <p className="text-xs text-zinc-400 mt-1 capitalize">{profile?.role}</p>
          </div>
          <Avatar className="h-8 w-8 border border-zinc-700">
            <AvatarImage src={profile?.profilePicture} alt={profile?.fullName} />
            <AvatarFallback className="bg-zinc-800 text-xs text-white">
              {getInitials(profile?.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

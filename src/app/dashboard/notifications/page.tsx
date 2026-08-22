"use client";

import { useEffect, useState } from "react";
import { getNotificationsByUser, markNotificationRead } from "@/lib/mockStore";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (profile) {
      setNotifications(getNotificationsByUser(profile.uid));
    }
  }, [profile]);

  const handleMarkRead = (id: string, isRead: boolean) => {
    if (isRead) return;
    markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="text-zinc-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`border-zinc-800 cursor-pointer transition-all ${
              notif.isRead ? "bg-zinc-950/40" : "bg-zinc-900 hover:border-purple-600/30"
            }`}
            onClick={() => handleMarkRead(notif.id, notif.isRead)}
          >
            <CardContent className="p-4 flex gap-4 items-start">
              <div
                className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${
                  notif.isRead ? "bg-zinc-800 text-zinc-600" : "bg-purple-600/20 text-purple-400"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-medium text-sm ${notif.isRead ? "text-zinc-500" : "text-white"}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-zinc-600 flex-shrink-0">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notif.isRead ? "text-zinc-600" : "text-zinc-300"}`}>
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && (
                <div className="flex-shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Bell className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

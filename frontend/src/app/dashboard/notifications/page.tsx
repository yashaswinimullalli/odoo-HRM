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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`border-border cursor-pointer transition-all ${
              notif.isRead ? "bg-muted/40 opacity-70" : "bg-card hover:border-purple-600/30 shadow-sm"
            }`}
            onClick={() => handleMarkRead(notif.id, notif.isRead)}
          >
            <CardContent className="p-4 flex gap-4 items-start">
              <div
                className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${
                  notif.isRead ? "bg-muted text-muted-foreground" : "bg-purple-600/10 text-purple-600 dark:text-purple-400"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-medium text-sm ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notif.isRead ? "text-muted-foreground" : "text-foreground/90"}`}>
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && (
                <div className="flex-shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

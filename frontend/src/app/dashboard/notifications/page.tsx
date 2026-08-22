"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Notification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getMyNotifications();
      setNotifications(res.notifications || []);
    } catch (err: any) {
      console.warn("[Notifications] Error loading:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadNotifications();
    }
  }, [profile]);

  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch (err: any) {
      toast.error("Failed to update notifications.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up with your updates."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="border-border text-foreground hover:bg-accent text-xs h-8 gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border-border cursor-pointer transition-all ${
                notif.isRead ? "bg-muted/30 opacity-75" : "bg-card hover:border-purple-600/40 shadow-xs"
              }`}
              onClick={() => handleMarkRead(notif.id, notif.isRead)}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                <div
                  className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${
                    notif.isRead
                      ? "bg-muted text-muted-foreground"
                      : "bg-purple-600/10 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3
                      className={`font-medium text-sm ${
                        notif.isRead ? "text-muted-foreground" : "text-foreground font-semibold"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                        : "recently"}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${notif.isRead ? "text-muted-foreground" : "text-foreground/90"}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 shadow-xs" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-xl shadow-xs">
              <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground text-base">No Notifications</h3>
              <p className="text-muted-foreground text-xs mt-1">
                You will receive alerts for leave approvals, payroll, and attendance here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

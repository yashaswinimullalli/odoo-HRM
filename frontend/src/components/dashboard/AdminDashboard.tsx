"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Clock, CalendarOff, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { getAllEmployees, getAllLeaves, getAttendanceByDate } from "@/lib/mockStore";
import { format } from "date-fns";
import Link from "next/link";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0, present: 0, absent: 0, halfDay: 0, onLeave: 0, pendingLeaves: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await api.getAdminDashboard();
        if (res.success && res.data) {
          const d = res.data;
          const s = d.summary || {};
          const att = d.today_attendance || {};
          setStats({
            total: parseInt(s.total_active_employees, 10) || 0,
            present: parseInt(att.present_count, 10) || 0,
            absent: parseInt(att.absent_count, 10) || 0,
            halfDay: parseInt(att.half_day_count, 10) || 0,
            onLeave: parseInt(att.on_leave_count, 10) || 0,
            pendingLeaves: parseInt(s.pending_leave_requests, 10) || 0,
          });
          if (d.pending_leaves) {
            setPendingLeaves(d.pending_leaves.map((l: any) => ({
              id: String(l.id),
              employeeName: l.employee_name,
              leaveType: l.leave_type === "PAID" ? "Paid Leave" : l.leave_type === "SICK" ? "Sick Leave" : "Unpaid Leave",
              startDate: l.start_date ? l.start_date.split("T")[0] : "",
              endDate: l.end_date ? l.end_date.split("T")[0] : "",
            })));
          }
          return;
        }
      } catch (err) {
        console.warn("[AdminDashboard] API fetch failed, fallback to mock data:", err);
      }

      // Mock fallback
      const today = format(new Date(), "yyyy-MM-dd");
      const employees = getAllEmployees();
      const todayAtt = getAttendanceByDate(today);
      const allLeaves = getAllLeaves();

      const present = todayAtt.filter((a) => a.status === "Present").length;
      const halfDay = todayAtt.filter((a) => a.status === "Half-day").length;
      const onLeave = todayAtt.filter((a) => a.status === "Leave").length;
      const absent = employees.length - todayAtt.length;
      const pendingCount = allLeaves.filter((l) => l.status === "Pending").length;

      setStats({ total: employees.length, present, absent, halfDay, onLeave, pendingLeaves: pendingCount });
      setPendingLeaves(allLeaves.filter((l) => l.status === "Pending").slice(0, 4));
      setRecentAttendance(todayAtt.slice(0, 5));
    }

    loadAdminData();
  }, []);

  const statCards = [
    { title: "Total Employees", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Present Today", value: stats.present, icon: UserCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Absent Today", value: stats.absent, icon: UserX, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Half Day", value: stats.halfDay, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "On Leave", value: stats.onLeave, icon: CalendarOff, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Pending Approvals", value: stats.pendingLeaves, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Present: "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10",
      Absent: "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10",
      "Half-day": "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/10",
      Leave: "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10",
    };
    return <Badge variant="outline" className={map[status] ?? "border-border text-muted-foreground"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="bg-card border-border transition-colors duration-200">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Attendance */}
        <Card className="bg-card border-border transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-foreground text-base">Today&apos;s Attendance Overview</CardTitle>
            <Link href="/dashboard/attendance">
              <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">Total present today: <strong className="text-green-600 dark:text-green-400">{stats.present}</strong></p>
                  <p className="text-xs text-muted-foreground mt-1">Visit the Attendance tab for complete daily rosters.</p>
                </div>
              )}
              {recentAttendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{a.checkInTime ? `In: ${a.checkInTime}` : "Not checked in"}</p>
                  </div>
                  {statusBadge(a.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-card border-border transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-foreground text-base">Pending Leave Requests</CardTitle>
            <Link href="/dashboard/leaves">
              <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs">Review All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLeaves.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending approvals. 🎉</p>
              )}
              {pendingLeaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{l.leaveType} · {l.startDate} to {l.endDate}</p>
                  </div>
                  <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

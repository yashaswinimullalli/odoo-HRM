"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, LogIn, LogOut, User, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTodayAttendance,
  getLeavesByUser,
  getPayrollByUser,
  checkIn,
  checkOut,
} from "@/lib/mockStore";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { AttendanceRecord } from "@/lib/types";

export function EmployeeDashboard() {
  const { profile } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [latestSalary, setLatestSalary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const att = getTodayAttendance(profile.uid);
    setTodayRecord(att ?? null);

    const leaves = getLeavesByUser(profile.uid);
    setPendingLeaves(leaves.filter((l) => l.status === "Pending").length);

    const pay = getPayrollByUser(profile.uid);
    setLatestSalary(pay[0] ?? null);
  }, [profile]);

  const handleCheckIn = () => {
    if (!profile) return;
    setLoading(true);
    setTimeout(() => {
      const record = checkIn(profile.uid, profile);
      setTodayRecord(record);
      toast.success(`Checked in at ${record.checkInTime}`);
      setLoading(false);
    }, 500);
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    setLoading(true);
    setTimeout(() => {
      const updated = checkOut(todayRecord.id);
      setTodayRecord(updated);
      toast.success(`Checked out at ${updated.checkOutTime} · ${updated.totalWorkingHours} hrs worked`);
      setLoading(false);
    }, 500);
  };

  const today = format(new Date(), "EEEE, MMMM do yyyy");

  const quickLinks = [
    { label: "My Profile", href: "/dashboard/profile", icon: User, color: "text-blue-400" },
    { label: "Attendance", href: "/dashboard/attendance", icon: Clock, color: "text-green-400" },
    { label: "Apply Leave", href: "/dashboard/leaves", icon: Calendar, color: "text-orange-400" },
    { label: "Payroll", href: "/dashboard/payroll", icon: FileText, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome + Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-950 rounded-xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"},{" "}
            {profile?.fullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-zinc-400 mt-1">{today}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleCheckIn}
            disabled={loading || !!todayRecord}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <LogIn className="h-4 w-4" />
            {todayRecord ? "Checked In" : "Check In"}
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={loading || !todayRecord || !!todayRecord.checkOutTime}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2"
          >
            <LogOut className="h-4 w-4" />
            {todayRecord?.checkOutTime ? "Checked Out" : "Check Out"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-400 mb-2">Today's Status</p>
            {todayRecord ? (
              <Badge
                variant="outline"
                className={
                  todayRecord.status === "Present"
                    ? "border-green-500 text-green-400"
                    : "border-orange-500 text-orange-400"
                }
              >
                {todayRecord.status}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-zinc-600 text-zinc-400">Not Checked In</Badge>
            )}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-400 mb-1">Check In</p>
            <p className="text-xl font-bold text-white">{todayRecord?.checkInTime ?? "--:--"}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-400 mb-1">Check Out</p>
            <p className="text-xl font-bold text-white">{todayRecord?.checkOutTime ?? "--:--"}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-400 mb-1">Pending Leaves</p>
            <p className="text-xl font-bold text-white">{pendingLeaves}</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Card + Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Current Month Salary</CardTitle>
          </CardHeader>
          <CardContent>
            {latestSalary ? (
              <div>
                <p className="text-3xl font-bold text-white">${latestSalary.netSalary.toLocaleString()}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Basic: ${latestSalary.basicSalary.toLocaleString()} + Allowances: ${latestSalary.allowances.toLocaleString()} - Deductions: ${latestSalary.deductions.toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No payroll data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-purple-600/40 transition-colors"
                  >
                    <Icon className={`h-4 w-4 ${link.color}`} />
                    <span className="text-sm text-zinc-300">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

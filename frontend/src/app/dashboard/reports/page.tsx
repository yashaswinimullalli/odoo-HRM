"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllEmployees, getAllLeaves, getAllPayroll } from "@/lib/mockStore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ReportsPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (profile?.role === "admin") {
      const employees = getAllEmployees();
      const leaves = getAllLeaves();
      const payroll = getAllPayroll();

      const pending = leaves.filter((l) => l.status === "Pending").length;
      const approved = leaves.filter((l) => l.status === "Approved").length;
      const rejected = leaves.filter((l) => l.status === "Rejected").length;

      const leaveByType = ["Paid Leave", "Sick Leave", "Unpaid Leave"].map((type) => ({
        name: type.replace(" Leave", ""),
        value: leaves.filter((l) => l.leaveType === type).length,
      }));

      // Payroll by department (sum of netSalary)
      const deptPayroll: Record<string, number> = {};
      employees.forEach((emp) => {
        const dept = emp.department ?? "Other";
        const empPayrolls = payroll.filter((p) => p.userId === emp.uid);
        const total = empPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
        deptPayroll[dept] = (deptPayroll[dept] ?? 0) + total;
      });
      const payrollByDept = Object.entries(deptPayroll).map(([dept, total]) => ({
        name: dept,
        total,
      }));

      setStats({
        totalEmployees: employees.length,
        totalLeaves: leaves.length,
        pending,
        approved,
        rejected,
        leaveStatusData: [
          { name: "Pending", value: pending, color: "#f59e0b" },
          { name: "Approved", value: approved, color: "#10b981" },
          { name: "Rejected", value: rejected, color: "#ef4444" },
        ],
        leaveByType,
        payrollByDept,
      });
    }
  }, [profile]);

  if (profile?.role !== "admin") return null;
  if (!stats) return null;

  const summaryCards = [
    { label: "Total Employees", value: stats.totalEmployees, color: "text-blue-500" },
    { label: "Total Leave Requests", value: stats.totalLeaves, color: "text-purple-500" },
    { label: "Pending", value: stats.pending, color: "text-amber-500" },
    { label: "Approved", value: stats.approved, color: "text-green-500" },
    { label: "Rejected", value: stats.rejected, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">System-wide metrics and visual analytics.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((c) => (
          <Card key={c.label} className="bg-card border-border transition-colors duration-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Leave Status Pie */}
        <Card className="bg-card border-border transition-colors duration-200">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Leave Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.leaveStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {stats.leaveStatusData.map((e: any, i: number) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave by Type Bar */}
        <Card className="bg-card border-border transition-colors duration-200">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Leave Requests by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.leaveByType} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payroll by Dept */}
      <Card className="bg-card border-border transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Total Payroll by Department</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.payrollByDept} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [`₹${Number(v || 0).toLocaleString()}`, "Total Payroll"]}
              />
              <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminAttendance } from "@/components/attendance/AdminAttendance";
import { EmployeeAttendance } from "@/components/attendance/EmployeeAttendance";

export default function AttendancePage() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Attendance</h1>
        <p className="text-zinc-400">
          {profile.role === "admin" 
            ? "Monitor and manage employee attendance records." 
            : "Track your daily working hours and attendance history."}
        </p>
      </div>

      {profile.role === "admin" ? <AdminAttendance /> : <EmployeeAttendance />}
    </div>
  );
}

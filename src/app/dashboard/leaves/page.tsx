"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminLeaves } from "@/components/leaves/AdminLeaves";
import { EmployeeLeaves } from "@/components/leaves/EmployeeLeaves";

export default function LeavesPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Leave & Time Off</h1>
        <p className="text-zinc-400">
          {profile.role === "admin" 
            ? "Manage and approve employee leave requests." 
            : "Apply for leaves and track your time off."}
        </p>
      </div>

      {profile.role === "admin" ? <AdminLeaves /> : <EmployeeLeaves />}
    </div>
  );
}

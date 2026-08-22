"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminPayroll } from "@/components/payroll/AdminPayroll";
import { EmployeePayroll } from "@/components/payroll/EmployeePayroll";

export default function PayrollPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payroll</h1>
        <p className="text-muted-foreground">
          {profile.role === "admin" 
            ? "Manage employee salary structures and payroll records." 
            : "View your salary details and download salary slips."}
        </p>
      </div>

      {profile.role === "admin" ? <AdminPayroll /> : <EmployeePayroll />}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getAllEmployees } from "@/lib/mockStore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";

export default function EmployeesPage() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (profile?.role === "admin") {
      setEmployees(getAllEmployees());
    }
  }, [profile]);

  if (profile?.role !== "admin") {
    return <div className="text-red-500 p-6">Access Denied.</div>;
  }

  const filtered = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Employees</h1>
          <p className="text-zinc-400">{employees.length} team members</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search employees..."
            className="pl-8 bg-zinc-950 border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((emp) => (
          <Link key={emp.uid} href={`/dashboard/employees/${emp.uid}`}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-600/50 transition-all hover:shadow-lg hover:shadow-purple-600/5 cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <Avatar className="h-20 w-20 border-2 border-zinc-700">
                  <AvatarImage src={emp.profilePicture} />
                  <AvatarFallback className="bg-zinc-800 text-xl text-white">
                    {emp.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">{emp.fullName}</h3>
                  <p className="text-sm text-zinc-400">{emp.designation ?? "Employee"}</p>
                </div>
                <div className="w-full pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
                  <span className="text-zinc-500">{emp.employeeId}</span>
                  <Badge variant="outline" className="border-purple-600/50 text-purple-400 bg-purple-600/5 text-xs">
                    {emp.department ?? "General"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-zinc-500">
            No employees matching &quot;{searchTerm}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}

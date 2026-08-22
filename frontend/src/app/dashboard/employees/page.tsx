"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getAllEmployees } from "@/lib/mockStore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, UserPlus, LayoutGrid, List, Key, Copy, CheckCircle2, Loader2, Phone, Mail, Building } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";

export default function EmployeesPage() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ login_id: string; temp_pass: string; name: string } | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "Software Engineer",
    joiningDate: new Date().toISOString().split("T")[0],
    basicSalary: "60000",
  });

  const loadEmployees = async () => {
    try {
      const live = await api.getEmployees();
      if (live && live.length > 0) {
        setEmployees(live as UserProfile[]);
        return;
      }
    } catch (e) {
      console.warn("[Employees] API fetch error, fallback to mock data:", e);
    }
    setEmployees(getAllEmployees());
  };

  useEffect(() => {
    if (profile?.role === "admin") {
      loadEmployees();
    }
  }, [profile]);

  if (profile?.role !== "admin") {
    return <div className="text-red-500 p-6">Access Denied. Admin privileges required.</div>;
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.email.trim()) {
      toast.error("First Name and Email are required.");
      return;
    }

    setLoading(true);
    try {
      // Call backend employee creation endpoint which auto-generates Login ID & temp password
      const res = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("dayflow_auth_token") || ""}`,
        },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          joining_date: formData.joiningDate,
          basic_salary: parseFloat(formData.basicSalary) || 50000,
          company_name: "Odoo India",
        }),
      });

      const data = await res.json();
      if (data.success && data.credentials) {
        setCreatedCredentials({
          login_id: data.credentials.login_id,
          temp_pass: data.credentials.temporary_password,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        });
        toast.success(`Employee created with Login ID: ${data.credentials.login_id}`);
        setIsAddOpen(false);
        loadEmployees();
      } else {
        throw new Error(data.message || "Failed to create employee");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  };

  const departments = ["ALL", ...Array.from(new Set(employees.map((e) => e.department).filter(Boolean)))];

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 p-5 rounded-xl border border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Employee Directory</h1>
          <p className="text-zinc-400 text-sm">{employees.length} active team members</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"}`}
              title="Kanban Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"}`}
              title="List Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add Employee Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger
              render={
                <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 text-sm shadow-md shadow-purple-900/20">
                  <UserPlus className="h-4 w-4" />
                  Add Employee
                </Button>
              }
            />
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white">Add New Employee</DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  System will automatically generate their <strong>Login ID</strong> (e.g. <code>OIJODO20260001</code>) and temporary password.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateEmployee} className="space-y-3.5 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">First Name *</Label>
                    <Input
                      required
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Last Name</Label>
                    <Input
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Work Email *</Label>
                    <Input
                      type="email"
                      required
                      placeholder="john.doe@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Phone</Label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Department</Label>
                    <Input
                      placeholder="Engineering"
                      value={formData.department}
                      onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Designation</Label>
                    <Input
                      placeholder="Software Engineer"
                      value={formData.designation}
                      onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Joining Date</Label>
                    <Input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData((p) => ({ ...p, joiningDate: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Monthly Basic Salary (INR)</Label>
                    <Input
                      type="number"
                      placeholder="60000"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData((p) => ({ ...p, basicSalary: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm h-9"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Employee & Generate ID
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Credentials Dialog (Shown immediately after creating employee) */}
      {createdCredentials && (
        <Dialog open={!!createdCredentials} onOpenChange={() => setCreatedCredentials(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
            <DialogHeader>
              <div className="inline-flex p-2 rounded-full bg-green-500/10 text-green-400 w-fit mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <DialogTitle className="text-lg font-bold text-white">Employee Onboarded Successfully!</DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs">
                Share these initial sign-in credentials with <strong>{createdCredentials.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 p-4 rounded-lg bg-zinc-950 border border-zinc-800 my-2">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                <span className="text-xs text-zinc-400">System Login ID:</span>
                <span className="font-mono font-bold text-purple-400 text-sm">{createdCredentials.login_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Initial Password:</span>
                <span className="font-mono font-bold text-green-400 text-sm">{createdCredentials.temp_pass}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(`Login ID: ${createdCredentials.login_id}\nPassword: ${createdCredentials.temp_pass}`);
                  toast.success("Credentials copied to clipboard!");
                  setCreatedCredentials(null);
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Credentials & Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, ID (e.g. OIJODO...), dept..."
            className="pl-9 bg-zinc-950 border-zinc-800 text-sm h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept || "ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedDept === dept
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View vs Table View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((emp) => (
            <Link key={emp.uid} href={`/dashboard/employees/${emp.uid}`}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-600/50 transition-all hover:shadow-xl hover:shadow-purple-900/10 cursor-pointer h-full group">
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-zinc-700 group-hover:border-purple-500 transition-colors">
                      <AvatarImage src={emp.profilePicture} />
                      <AvatarFallback className="bg-zinc-800 text-xl font-bold text-white">
                        {emp.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-zinc-900" title="Active" />
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                      {emp.fullName}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{emp.designation ?? "Employee"}</p>
                  </div>

                  <div className="w-full pt-3 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-400 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Login ID:</span>
                      <span className="font-mono font-semibold text-purple-400">{emp.employeeId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Dept:</span>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10 text-[10px]">
                        {emp.department ?? "General"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* List Table View */
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Login ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map((emp) => (
                  <tr key={emp.uid} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-700">
                        <AvatarImage src={emp.profilePicture} />
                        <AvatarFallback className="bg-zinc-800 text-xs text-white">
                          {emp.fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">{emp.fullName}</p>
                        <p className="text-xs text-zinc-500">{emp.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-purple-400">{emp.employeeId}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-xs">
                        {emp.department ?? "General"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{emp.designation ?? "Specialist"}</td>
                    <td className="py-3 px-4 text-xs text-zinc-400">{emp.phone || "—"}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/dashboard/employees/${emp.uid}`}>
                        <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 text-xs">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/60">
          No employees matching &quot;{searchTerm}&quot;.
        </div>
      )}
    </div>
  );
}

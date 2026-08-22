"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getUserById, updateUser } from "@/lib/mockStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Save,
  Upload,
} from "lucide-react";
import { UserProfile } from "@/lib/types";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empData, setEmpData] = useState<any | null>(null);

  useEffect(() => {
    async function loadEmployee() {
      const empId = params.id as string;
      if (!empId) return;

      try {
        const live = await api.getEmployeeById(empId);
        if (live && live.uid) {
          setEmpData(live);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[EmployeeDetailPage] API fetch error, fallback to mockStore:", err);
      }

      // Mock fallback
      const found = getUserById(empId);
      if (found) {
        setEmpData({
          ...found,
          gender: "PREFER_NOT_TO_SAY",
          address: found.address || "123 Technology Park, Bengaluru, Karnataka",
          salaryStructure: {
            basic_salary: 60000,
            hra: 20000,
            allowances: 10000,
            deductions: 5000,
            net_salary: 85000,
          },
          documents: [
            { id: "doc-1", document_type: "ID_PROOF", document_name: "Aadhaar_Card.pdf", uploaded_at: "2026-01-10" },
            { id: "doc-2", document_type: "RESUME", document_name: "Resume_2026.pdf", uploaded_at: "2026-01-12" },
          ],
        });
      } else {
        toast.error("Employee not found");
        router.push("/dashboard/employees");
      }
      setLoading(false);
    }

    loadEmployee();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!empData) {
    return null;
  }

  const handleChange = (field: string, value: any) => {
    setEmpData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSalaryChange = (field: string, value: string) => {
    const num = parseFloat(value) || 0;
    setEmpData((prev: any) => {
      const current = prev.salaryStructure || { basic_salary: 0, hra: 0, allowances: 0, deductions: 0 };
      const updated = { ...current, [field]: num };
      const net = (updated.basic_salary || 0) + (updated.hra || 0) + (updated.allowances || 0) - (updated.deductions || 0);
      updated.net_salary = Math.max(0, net);
      return { ...prev, salaryStructure: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        first_name: empData.firstName || empData.fullName?.split(" ")[0] || "Employee",
        last_name: empData.lastName || empData.fullName?.split(" ").slice(1).join(" ") || "",
        phone: empData.phone,
        address: empData.address,
        employment_status: empData.employmentType || "ACTIVE",
        basic_salary: empData.salaryStructure?.basic_salary,
        hra: empData.salaryStructure?.hra,
        allowances: empData.salaryStructure?.allowances,
        deductions: empData.salaryStructure?.deductions,
      };

      await api.updateEmployee(params.id as string, payload);
      updateUser(empData.uid || (params.id as string), {
        fullName: `${payload.first_name} ${payload.last_name}`.trim(),
        phone: payload.phone,
        address: payload.address,
        employmentType: payload.employment_status,
      });

      toast.success("Employee details & salary updated and saved successfully!");
    } catch (err: any) {
      // Fallback
      updateUser(empData.uid || (params.id as string), {
        phone: empData.phone,
        address: empData.address,
      });
      toast.success("Employee details updated in session.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employee Profile</h1>
          <p className="text-muted-foreground text-xs">Manage personal details, job roles, compensation package, and documents.</p>
        </div>
      </div>

      {/* Header Profile Summary Card */}
      <Card className="bg-card border-border text-foreground shadow-sm overflow-hidden transition-colors duration-200">
        <div className="h-24 bg-gradient-to-r from-purple-600/30 via-purple-500/10 to-transparent border-b border-border" />
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg bg-muted">
                <AvatarImage src={empData.profilePicture} />
                <AvatarFallback className="bg-muted text-2xl font-bold text-foreground">
                  {empData.fullName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {empData.fullName}
                  <Badge variant="outline" className="border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/10 text-xs">
                    Active
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground">{empData.designation ?? "Specialist"} · {empData.department ?? "General"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block uppercase tracking-wider font-semibold">Login ID / Code</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">{empData.employeeId}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-muted border border-border p-1 rounded-xl">
          <TabsTrigger value="personal" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs gap-1.5 py-2">
            <User className="h-3.5 w-3.5" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="job" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs gap-1.5 py-2">
            <Briefcase className="h-3.5 w-3.5" />
            Job Details
          </TabsTrigger>
          <TabsTrigger value="salary" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs gap-1.5 py-2">
            <CreditCard className="h-3.5 w-3.5" />
            Salary & Payroll
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs gap-1.5 py-2">
            <FileText className="h-3.5 w-3.5" />
            Documents
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          {/* Tab 1: Personal Info */}
          <TabsContent value="personal" className="space-y-4">
            <Card className="bg-card border-border transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Full Name</Label>
                    <Input value={empData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Email Address</Label>
                    <Input value={empData.email} disabled className="bg-muted border-border text-muted-foreground text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Phone Number</Label>
                    <Input value={empData.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+91 98765 43210" className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Gender</Label>
                    <Input value={empData.gender || "PREFER_NOT_TO_SAY"} onChange={(e) => handleChange("gender", e.target.value)} className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-foreground">Residential Address</Label>
                    <Input value={empData.address || ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="Full street address..." className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Job Details */}
          <TabsContent value="job" className="space-y-4">
            <Card className="bg-card border-border transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Employment & Designation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Login ID / Employee Code</Label>
                    <Input value={empData.employeeId} disabled className="bg-muted border-border font-mono text-purple-600 dark:text-purple-400 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Department</Label>
                    <Input value={empData.department || ""} onChange={(e) => handleChange("department", e.target.value)} className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Designation / Role Title</Label>
                    <Input value={empData.designation || ""} onChange={(e) => handleChange("designation", e.target.value)} className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Joining Date</Label>
                    <Input type="date" value={empData.joiningDate || ""} onChange={(e) => handleChange("joiningDate", e.target.value)} className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Employment Type</Label>
                    <Input value={empData.employmentType || "Full-time"} onChange={(e) => handleChange("employmentType", e.target.value)} className="bg-background border-border text-foreground text-sm h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Salary & Payroll */}
          <TabsContent value="salary" className="space-y-4">
            <Card className="bg-card border-border transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Monthly Compensation Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Basic Salary (INR)</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.basic_salary || 0}
                      onChange={(e) => handleSalaryChange("basic_salary", e.target.value)}
                      className="bg-background border-border text-foreground text-sm h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">House Rent Allowance (HRA)</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.hra || 0}
                      onChange={(e) => handleSalaryChange("hra", e.target.value)}
                      className="bg-background border-border text-foreground text-sm h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Special & Travel Allowances</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.allowances || 0}
                      onChange={(e) => handleSalaryChange("allowances", e.target.value)}
                      className="bg-background border-border text-foreground text-sm h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">PF & Tax Deductions</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.deductions || 0}
                      onChange={(e) => handleSalaryChange("deductions", e.target.value)}
                      className="bg-background border-border text-foreground text-sm h-10"
                    />
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-medium uppercase tracking-wider">Calculated Net Monthly Salary</p>
                      <p className="text-2xl font-bold text-foreground mt-0.5">
                        ₹{(empData.salaryStructure?.net_salary || 0).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-purple-600 text-white text-xs">Direct Credit</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Documents */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="bg-card border-border transition-colors duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base text-foreground">Employee Documents</CardTitle>
                <Button size="sm" type="button" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {(empData.documents || []).length === 0 && (
                    <p className="text-muted-foreground text-sm py-6 text-center">No documents uploaded yet.</p>
                  )}
                  {(empData.documents || []).map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.document_name}</p>
                          <p className="text-xs text-muted-foreground">{doc.document_type} · Uploaded on {doc.uploaded_at?.split("T")[0] || "2026-01-15"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-border text-muted-foreground text-xs">Verified</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Save Button */}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-semibold shadow-md shadow-purple-900/30">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Changes
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}

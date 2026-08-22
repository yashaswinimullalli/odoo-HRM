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
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { profile: currentUser } = useAuth();

  const [empData, setEmpData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployee() {
      if (params.id) {
        try {
          const live = await api.getEmployeeById(params.id as string);
          if (live) {
            setEmpData(live);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("[EmployeeDetails] API error, fallback to mock data:", e);
        }

        const found = getUserById(params.id as string);
        if (found) {
          setEmpData({
            ...found,
            salaryStructure: {
              basic_salary: 60000,
              hra: 20000,
              allowances: 10000,
              deductions: 5000,
              net_salary: 85000,
              currency: "INR",
            },
            documents: [
              { id: "1", document_name: "Offer_Letter.pdf", document_type: "OFFER_LETTER", uploaded_at: "2026-01-15" },
              { id: "2", document_name: "Resume_CV.pdf", document_type: "RESUME", uploaded_at: "2026-01-10" },
            ],
          });
        } else {
          toast.error("Employee not found");
          router.push("/dashboard/employees");
        }
      }
      setLoading(false);
    }

    loadEmployee();
  }, [params.id, router]);

  if (currentUser?.role !== "admin") return null;

  if (loading || !empData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const handleChange = (field: string, val: string) => {
    setEmpData((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleSalaryChange = (field: string, val: string) => {
    setEmpData((prev: any) => {
      const currentSal = prev.salaryStructure || {};
      const updated = { ...currentSal, [field]: parseFloat(val) || 0 };
      const basic = parseFloat(updated.basic_salary || 0);
      const hra = parseFloat(updated.hra || 0);
      const allow = parseFloat(updated.allowances || 0);
      const ded = parseFloat(updated.deductions || 0);
      updated.net_salary = basic + hra + allow - ded;
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
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Employee Profile</h1>
          <p className="text-zinc-400 text-xs">Manage personal details, job roles, compensation package, and documents.</p>
        </div>
      </div>

      {/* Header Profile Summary Card */}
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-purple-900/50 via-purple-700/20 to-zinc-900 border-b border-zinc-800/80" />
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-zinc-900 shadow-2xl bg-zinc-800">
                <AvatarImage src={empData.profilePicture} />
                <AvatarFallback className="bg-zinc-800 text-2xl font-bold text-white">
                  {empData.fullName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {empData.fullName}
                  <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/10 text-xs">
                    Active
                  </Badge>
                </h2>
                <p className="text-xs text-zinc-400">{empData.designation ?? "Specialist"} · {empData.department ?? "General"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block uppercase tracking-wider font-semibold">Login ID / Code</span>
                <span className="font-mono font-bold text-purple-400 text-sm">{empData.employeeId}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs (Wireframe Sections) */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
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
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base text-white">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Full Name</Label>
                    <Input value={empData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Email Address</Label>
                    <Input value={empData.email} disabled className="bg-zinc-950/60 border-zinc-800 text-zinc-500 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Phone Number</Label>
                    <Input value={empData.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+91 98765 43210" className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Gender</Label>
                    <Input value={empData.gender || "PREFER_NOT_TO_SAY"} onChange={(e) => handleChange("gender", e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-zinc-300">Residential Address</Label>
                    <Input value={empData.address || ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="Full street address..." className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Job Details */}
          <TabsContent value="job" className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base text-white">Employment & Designation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Login ID / Employee Code</Label>
                    <Input value={empData.employeeId} disabled className="bg-zinc-950/60 border-zinc-800 font-mono text-purple-400 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Department</Label>
                    <Input value={empData.department || ""} onChange={(e) => handleChange("department", e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Designation / Role Title</Label>
                    <Input value={empData.designation || ""} onChange={(e) => handleChange("designation", e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Joining Date</Label>
                    <Input type="date" value={empData.joiningDate || ""} onChange={(e) => handleChange("joiningDate", e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Employment Type</Label>
                    <Input value={empData.employmentType || "Full-time"} onChange={(e) => handleChange("employmentType", e.target.value)} className="bg-zinc-950 border-zinc-800 text-sm h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Salary & Payroll */}
          <TabsContent value="salary" className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base text-white">Monthly Compensation Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Basic Salary (INR)</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.basic_salary || 0}
                      onChange={(e) => handleSalaryChange("basic_salary", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-sm h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">House Rent Allowance (HRA)</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.hra || 0}
                      onChange={(e) => handleSalaryChange("hra", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-sm h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Special & Travel Allowances</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.allowances || 0}
                      onChange={(e) => handleSalaryChange("allowances", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-sm h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">PF & Tax Deductions</Label>
                    <Input
                      type="number"
                      value={empData.salaryStructure?.deductions || 0}
                      onChange={(e) => handleSalaryChange("deductions", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-sm h-10"
                    />
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-xl bg-purple-950/20 border border-purple-600/30 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-purple-300 font-medium uppercase tracking-wider">Calculated Net Monthly Salary</p>
                      <p className="text-2xl font-bold text-white mt-0.5">
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
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base text-white">Employee Documents</CardTitle>
                <Button size="sm" type="button" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {(empData.documents || []).length === 0 && (
                    <p className="text-zinc-500 text-sm py-6 text-center">No documents uploaded yet.</p>
                  )}
                  {(empData.documents || []).map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{doc.document_name}</p>
                          <p className="text-xs text-zinc-500">{doc.document_type} · Uploaded on {doc.uploaded_at?.split("T")[0] || "2026-01-15"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">Verified</Badge>
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

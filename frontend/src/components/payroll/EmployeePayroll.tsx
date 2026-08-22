"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Banknote, ShieldCheck, Printer } from "lucide-react";
import { PayrollRecord } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";

export function EmployeePayroll() {
  const { profile } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  const [salaryStructure, setSalaryStructure] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const [payrollList, structure] = await Promise.allSettled([
        api.getMyPayroll(),
        api.getMySalaryStructure(),
      ]);

      if (structure.status === "fulfilled" && structure.value) {
        setSalaryStructure(structure.value);
      }

      if (payrollList.status === "fulfilled" && payrollList.value && payrollList.value.length > 0) {
        const pList = payrollList.value as PayrollRecord[];
        setPayrolls(pList);
        setSelectedSlip(pList[0]);
      } else if (structure.status === "fulfilled" && structure.value) {
        // Create an active current period slip view from salary structure
        const s = structure.value;
        const currentSlip = {
          id: "current",
          userId: profile?.uid || "",
          employeeId: profile?.employeeId || "",
          month: format(new Date(), "MMMM yyyy"),
          basicSalary: s.basicSalary,
          allowances: s.allowances + s.hra,
          deductions: s.deductions,
          netSalary: s.netSalary,
          createdAt: new Date().toISOString().split("T")[0],
          paymentStatus: "PROCESSED",
        };
        setSelectedSlip(currentSlip);
      }
    } catch (err: any) {
      console.warn("[Payroll] Error loading payroll data:", err);
      toast.error(err.message || "Failed to load payroll records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadPayrollData();
    }
  }, [profile]);

  const handlePrint = () => {
    toast.info("Opening print dialog for salary slip...");
    setTimeout(() => window.print(), 300);
  };

  const statusBadge = (status?: string) => {
    const s = (status || "PROCESSED").toUpperCase();
    if (s === "PAID") return <Badge className="bg-green-600 text-white text-[10px]">PAID</Badge>;
    if (s === "PROCESSED") return <Badge variant="outline" className="border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10 text-[10px]">PROCESSED</Badge>;
    return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-[10px]">{s}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Salary Overview Card */}
      {salaryStructure && (
        <Card className="bg-card border-border transition-colors duration-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-foreground text-base">Current Compensation Structure</CardTitle>
            </div>
            <Badge variant="outline" className="border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/10 text-xs">
              Direct Bank Credit
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border border-border/80">
              <div>
                <p className="text-xs text-muted-foreground">Basic Salary</p>
                <p className="text-base font-bold text-foreground mt-0.5">₹{salaryStructure.basicSalary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">HRA & Allowances</p>
                <p className="text-base font-bold text-green-600 dark:text-green-400 mt-0.5">
                  +₹{(salaryStructure.hra + salaryStructure.allowances).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Standard Deductions</p>
                <p className="text-base font-bold text-red-600 dark:text-red-400 mt-0.5">
                  -₹{salaryStructure.deductions.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">Net Monthly Pay</p>
                <p className="text-lg font-black text-foreground mt-0.5">
                  ₹{salaryStructure.netSalary.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salary History Table */}
      <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-base">Monthly Salary Records & Slips</CardTitle>
            <CardDescription className="text-muted-foreground text-xs mt-0.5">
              Select any period to preview and print your official salary slip.
            </CardDescription>
          </div>
          {selectedSlip && (
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs h-8 shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Selected Slip
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Period</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Basic</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Allowances</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Deductions</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Net Pay</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((p) => (
                    <TableRow
                      key={p.id}
                      className={`border-border hover:bg-accent/40 cursor-pointer text-xs ${
                        selectedSlip?.id === p.id ? "bg-purple-600/10 font-medium" : ""
                      }`}
                      onClick={() => setSelectedSlip(p)}
                    >
                      <TableCell className="font-semibold text-foreground">{p.month}</TableCell>
                      <TableCell className="text-foreground">₹{p.basicSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">+₹{p.allowances.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">-₹{p.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-foreground">₹{p.netSalary.toLocaleString()}</TableCell>
                      <TableCell>{statusBadge(p.paymentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlip(p);
                            handlePrint();
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Slip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {payrolls.length === 0 && selectedSlip && (
                    <TableRow
                      className="border-border bg-purple-600/5 text-xs"
                      onClick={() => setSelectedSlip(selectedSlip)}
                    >
                      <TableCell className="font-semibold text-foreground">{selectedSlip.month}</TableCell>
                      <TableCell className="text-foreground">₹{selectedSlip.basicSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">+₹{selectedSlip.allowances.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">-₹{selectedSlip.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-foreground">₹{selectedSlip.netSalary.toLocaleString()}</TableCell>
                      <TableCell>{statusBadge("PROCESSED")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrint();
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Slip
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {payrolls.length === 0 && !selectedSlip && (
                    <TableRow className="border-border">
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10 text-xs">
                        No payroll records found for this employee.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Printable Salary Slip Component (Triggered via window.print) */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[999] font-sans">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-purple-700">Dayflow HRMS</h1>
              <p className="text-gray-500 text-sm mt-1">Official Monthly Compensation Statement</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">SALARY SLIP</h2>
              <p className="text-sm text-gray-500">Generated on {format(new Date(), "dd MMM yyyy")}</p>
            </div>
          </div>

          {selectedSlip && profile && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Employee Name</p>
                  <p className="font-bold text-gray-800 mt-0.5">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Employee / Login ID</p>
                  <p className="font-bold text-gray-800 font-mono mt-0.5">{profile.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Department & Role</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{profile.department ?? "Engineering"} · {profile.designation ?? "Specialist"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Payroll Period</p>
                  <p className="font-bold text-purple-700 mt-0.5">{selectedSlip.month}</p>
                </div>
              </div>

              <table className="w-full border-collapse mb-6 text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Earnings & Deductions Item</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Monthly Basic Salary</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">₹{selectedSlip.basicSalary.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">HRA & Special Allowances</td>
                    <td className="py-3 px-4 text-right font-medium text-green-700">+₹{selectedSlip.allowances.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">PF, Professional Tax & Deductions</td>
                    <td className="py-3 px-4 text-right font-medium text-red-700">-₹{selectedSlip.deductions.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-purple-50 border-t-2 border-purple-200">
                    <td className="py-4 px-4 font-bold text-gray-900 text-base">Net Credited Salary</td>
                    <td className="py-4 px-4 text-right font-black text-purple-800 text-lg">
                      ₹{selectedSlip.netSalary.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-gray-200 pt-6 mt-8 flex justify-between items-center text-xs text-gray-400">
                <p>Confidential · Generated by Dayflow HRMS Cloud</p>
                <p>No signature required (System Verified)</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

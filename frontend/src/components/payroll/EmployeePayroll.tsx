"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getPayrollByUser } from "@/lib/mockStore";
import { PayrollRecord } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";

export function EmployeePayroll() {
  const { profile } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    if (profile) {
      const data = getPayrollByUser(profile.uid);
      setPayrolls(data);
      setSelectedSlip(data[0] ?? null);
    }
  }, [profile]);

  const handlePrint = () => {
    toast.info("Opening print dialog for salary slip...");
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="bg-card border-border transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-foreground">My Salary Slips</CardTitle>
          <CardDescription className="text-muted-foreground">
            View your monthly salary breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Month</TableHead>
                  <TableHead className="text-muted-foreground">Basic Salary</TableHead>
                  <TableHead className="text-muted-foreground">Allowances</TableHead>
                  <TableHead className="text-muted-foreground">Deductions</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Net Salary</TableHead>
                  <TableHead className="text-right text-muted-foreground">Slip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`border-border hover:bg-accent/40 cursor-pointer ${selectedSlip?.id === p.id ? "bg-purple-600/10" : ""}`}
                    onClick={() => setSelectedSlip(p)}
                  >
                    <TableCell className="font-medium text-foreground">{p.month}</TableCell>
                    <TableCell className="text-foreground">₹{p.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">+₹{p.allowances.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600 dark:text-red-400">-₹{p.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-bold text-foreground">₹{p.netSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlip(p);
                          handlePrint();
                        }}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {payrolls.length === 0 && (
                  <TableRow className="border-border">
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No payroll records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Printable Salary Slip */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[999] font-sans">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-purple-700">Dayflow</h1>
              <p className="text-gray-500 text-sm">Every workday, perfectly aligned.</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">SALARY SLIP</h2>
              <p className="text-sm text-gray-500">Generated: {format(new Date(), "dd MMM yyyy")}</p>
            </div>
          </div>
          {selectedSlip && profile && (
            <>
              <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Employee Name</p>
                  <p className="font-semibold text-gray-800">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Employee ID</p>
                  <p className="font-semibold text-gray-800">{profile.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="font-semibold text-gray-800">{profile.department ?? "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Salary Month</p>
                  <p className="font-semibold text-gray-800">{selectedSlip.month}</p>
                </div>
              </div>
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Basic Salary</td>
                    <td className="py-3 px-4 text-right text-gray-800">₹{selectedSlip.basicSalary.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Allowances</td>
                    <td className="py-3 px-4 text-right text-green-600">+₹{selectedSlip.allowances.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Deductions</td>
                    <td className="py-3 px-4 text-right text-red-600">-₹{selectedSlip.deductions.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-purple-50">
                    <td className="py-4 px-4 font-bold text-gray-900 text-lg">Net Salary</td>
                    <td className="py-4 px-4 text-right font-bold text-purple-700 text-lg">
                      ₹{selectedSlip.netSalary.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-400 text-center border-t pt-4">
                This is a computer-generated salary slip. No signature required.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

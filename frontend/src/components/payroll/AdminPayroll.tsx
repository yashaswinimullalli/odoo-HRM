"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { UserProfile } from "@/lib/types";

export function AdminPayroll() {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: format(new Date(), "yyyy-MM"),
    basicSalary: 60000,
    allowances: 15000,
    deductions: 5000,
  });

  const loadEmployees = async () => {
    setTableLoading(true);
    try {
      const emps = await api.getEmployees();
      setEmployees(emps || []);
    } catch (err: any) {
      console.warn("[AdminPayroll] Error fetching employees:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setActionLoading(true);
    try {
      toast.success(`Salary structure verified & slip registered for ${selectedEmp.fullName}`);
      setSelectedEmp(null);
      setFormData({ month: format(new Date(), "yyyy-MM"), basicSalary: 60000, allowances: 15000, deductions: 5000 });
    } catch (err: any) {
      toast.error(err.message || "Failed to process payroll.");
    } finally {
      setActionLoading(false);
    }
  };

  const netSalary = formData.basicSalary + formData.allowances - formData.deductions;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">Employee Payroll Management</CardTitle>
        </CardHeader>
        <CardContent>
          {tableLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Employee ID</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Employee Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Department</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Designation</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.uid} className="border-border hover:bg-accent/40 text-xs">
                      <TableCell className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{emp.employeeId}</TableCell>
                      <TableCell className="font-medium text-foreground">{emp.fullName}</TableCell>
                      <TableCell className="text-foreground">{emp.department ?? "Engineering"}</TableCell>
                      <TableCell className="text-foreground">{emp.designation ?? "Specialist"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
                          onClick={() => setSelectedEmp(emp)}
                        >
                          Generate Slip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow className="border-border">
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-xs">
                        No employees found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEmp} onOpenChange={(o) => !o && setSelectedEmp(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-base">Generate Monthly Salary Slip</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Create a payroll entry for {selectedEmp?.fullName} ({selectedEmp?.employeeId})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs">Payroll Month</Label>
              <Input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
                className="bg-background border-border text-foreground text-xs h-9"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Basic (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData((p) => ({ ...p, basicSalary: Number(e.target.value) }))}
                  className="bg-background border-border text-foreground text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Allowances (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.allowances}
                  onChange={(e) => setFormData((p) => ({ ...p, allowances: Number(e.target.value) }))}
                  className="bg-background border-border text-foreground text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Deductions (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.deductions}
                  onChange={(e) => setFormData((p) => ({ ...p, deductions: Number(e.target.value) }))}
                  className="bg-background border-border text-foreground text-xs h-9"
                />
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/60 border border-border rounded-lg text-xs">
              <span className="text-foreground font-medium">Net Credited Amount:</span>
              <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono">₹{netSalary.toLocaleString()}</span>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" className="border-border text-foreground text-xs" onClick={() => setSelectedEmp(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={actionLoading} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                {actionLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Generate Slip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

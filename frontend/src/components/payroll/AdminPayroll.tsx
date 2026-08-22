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
import { getAllEmployees, createPayroll } from "@/lib/mockStore";
import { UserProfile } from "@/lib/types";

export function AdminPayroll() {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: format(new Date(), "yyyy-MM"),
    basicSalary: 50000,
    allowances: 10000,
    deductions: 5000,
  });

  useEffect(() => {
    setEmployees(getAllEmployees());
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setActionLoading(true);
    setTimeout(() => {
      createPayroll(selectedEmp.uid, selectedEmp.employeeId, formData);
      toast.success(`Salary slip generated for ${selectedEmp.fullName}`);
      setSelectedEmp(null);
      setFormData({ month: format(new Date(), "yyyy-MM"), basicSalary: 50000, allowances: 10000, deductions: 5000 });
      setActionLoading(false);
    }, 500);
  };

  const netSalary = formData.basicSalary + formData.allowances - formData.deductions;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-foreground">Employee Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Employee</TableHead>
                  <TableHead className="text-muted-foreground">Department</TableHead>
                  <TableHead className="text-muted-foreground">Designation</TableHead>
                  <TableHead className="text-right text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.uid} className="border-border hover:bg-accent/40">
                    <TableCell>
                      <div className="font-medium text-foreground">{emp.fullName}</div>
                      <div className="text-xs text-muted-foreground">{emp.employeeId}</div>
                    </TableCell>
                    <TableCell className="text-foreground">{emp.department ?? "--"}</TableCell>
                    <TableCell className="text-foreground">{emp.designation ?? "--"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setSelectedEmp(emp)}
                      >
                        Generate Slip
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEmp} onOpenChange={(o) => !o && setSelectedEmp(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Generate Salary Slip</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a payroll record for {selectedEmp?.fullName} ({selectedEmp?.employeeId})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground">Month</Label>
              <Input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Basic Salary (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData((p) => ({ ...p, basicSalary: Number(e.target.value) }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Allowances (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.allowances}
                  onChange={(e) => setFormData((p) => ({ ...p, allowances: Number(e.target.value) }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Deductions (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.deductions}
                  onChange={(e) => setFormData((p) => ({ ...p, deductions: Number(e.target.value) }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted border border-border rounded-lg">
              <span className="text-foreground font-medium">Net Salary</span>
              <span className="text-xl font-bold text-foreground">₹{netSalary.toLocaleString()}</span>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" className="border-border text-foreground" onClick={() => setSelectedEmp(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

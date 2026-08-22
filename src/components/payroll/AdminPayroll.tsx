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
    basicSalary: 5000,
    allowances: 1000,
    deductions: 500,
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
      setFormData({ month: format(new Date(), "yyyy-MM"), basicSalary: 5000, allowances: 1000, deductions: 500 });
      setActionLoading(false);
    }, 500);
  };

  const netSalary = formData.basicSalary + formData.allowances - formData.deductions;

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Employee Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Employee</TableHead>
                  <TableHead className="text-zinc-400">Department</TableHead>
                  <TableHead className="text-zinc-400">Designation</TableHead>
                  <TableHead className="text-right text-zinc-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.uid} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell>
                      <div className="font-medium text-white">{emp.fullName}</div>
                      <div className="text-xs text-zinc-500">{emp.employeeId}</div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{emp.department ?? "--"}</TableCell>
                    <TableCell className="text-zinc-300">{emp.designation ?? "--"}</TableCell>
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
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Generate Salary Slip</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Create a payroll record for {selectedEmp?.fullName} ({selectedEmp?.employeeId})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Month</Label>
              <Input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Basic Salary ($)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData((p) => ({ ...p, basicSalary: Number(e.target.value) }))}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Allowances ($)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.allowances}
                  onChange={(e) => setFormData((p) => ({ ...p, allowances: Number(e.target.value) }))}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Deductions ($)</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={formData.deductions}
                  onChange={(e) => setFormData((p) => ({ ...p, deductions: Number(e.target.value) }))}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
              <span className="text-zinc-300 font-medium">Net Salary</span>
              <span className="text-xl font-bold text-white">${netSalary.toLocaleString()}</span>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setSelectedEmp(null)}>
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

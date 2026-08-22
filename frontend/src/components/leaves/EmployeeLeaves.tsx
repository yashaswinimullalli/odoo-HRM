"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CalendarPlus } from "lucide-react";
import { LeaveRecord } from "@/lib/types";

export function EmployeeLeaves() {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [formData, setFormData] = useState({
    leaveType: "Paid Leave" as LeaveRecord["leaveType"],
    startDate: "",
    endDate: "",
    remarks: "",
  });

  const loadLeaves = async () => {
    try {
      setTableLoading(true);
      const data = await api.getMyLeaves();
      setLeaves(data || []);
    } catch (err: any) {
      console.warn("[Leaves] Failed to load leaves:", err);
      toast.error(err.message || "Failed to load leave history.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadLeaves();
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!formData.startDate || !formData.endDate || !formData.remarks.trim()) {
      toast.error("Please fill in all required leave details.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    setLoading(true);
    try {
      await api.applyLeave({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.remarks.trim(),
      });

      toast.success("Leave request submitted successfully!");
      setFormData({ leaveType: "Paid Leave", startDate: "", endDate: "", remarks: "" });
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Approved: "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10",
      Rejected: "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10",
      Pending: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    };
    return (
      <Badge variant="outline" className={map[status] ?? "border-border text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Apply Form */}
      <Card className="bg-card border-border md:col-span-1 h-fit transition-colors duration-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-foreground text-base">Apply for Leave</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-xs">
            Submit a formal time-off request to HR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs">Leave Type</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(v) => setFormData((p) => ({ ...p, leaveType: v as LeaveRecord["leaveType"] }))}
              >
                <SelectTrigger className="bg-background border-border text-foreground text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="Paid Leave">Paid Leave (Annual)</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave (Medical)</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Start Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  className="bg-background border-border text-foreground text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">End Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                  className="bg-background border-border text-foreground text-xs h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs">Reason / Remarks *</Label>
              <Textarea
                required
                value={formData.remarks}
                onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))}
                className="bg-background border-border text-foreground focus-visible:ring-purple-600 min-h-[90px] text-xs"
                placeholder="Explain the reason for your time-off request..."
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs h-9"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Leave Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card className="bg-card border-border md:col-span-2 transition-colors duration-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">My Leave Requests</CardTitle>
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
                    <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Duration</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Remarks / Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id} className="border-border hover:bg-accent/40">
                      <TableCell className="font-medium text-foreground text-xs">{leave.leaveType}</TableCell>
                      <TableCell className="text-foreground text-xs whitespace-nowrap">
                        {leave.startDate} <span className="text-muted-foreground">→</span> {leave.endDate}
                      </TableCell>
                      <TableCell>{statusBadge(leave.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[220px]">
                        <p className="truncate text-foreground/90">{leave.remarks}</p>
                        {leave.adminComment && (
                          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                            Note: {leave.adminComment}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaves.length === 0 && (
                    <TableRow className="border-border">
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-10 text-xs">
                        No leave history found. Use the form on the left to submit a request.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

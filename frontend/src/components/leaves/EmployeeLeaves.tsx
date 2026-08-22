"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getLeavesByUser, applyLeave } from "@/lib/mockStore";
import { LeaveRecord } from "@/lib/types";

export function EmployeeLeaves() {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "Paid Leave" as LeaveRecord["leaveType"],
    startDate: "",
    endDate: "",
    remarks: "",
  });

  useEffect(() => {
    if (profile) setLeaves(getLeavesByUser(profile.uid));
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      applyLeave(profile.uid, profile, formData);
      setLeaves(getLeavesByUser(profile.uid));
      setFormData({ leaveType: "Paid Leave", startDate: "", endDate: "", remarks: "" });
      toast.success("Leave request submitted successfully.");
      setLoading(false);
    }, 500);
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
      <Card className="bg-card border-border md:col-span-1 h-fit transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-foreground">Apply for Leave</CardTitle>
          <CardDescription className="text-muted-foreground">Submit a new time-off request.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Leave Type</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(v) => setFormData((p) => ({ ...p, leaveType: v as LeaveRecord["leaveType"] }))}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="Paid Leave">Paid Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Start Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">End Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Reason / Remarks</Label>
              <Textarea
                required
                value={formData.remarks}
                onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))}
                className="bg-background border-border text-foreground focus-visible:ring-purple-600 min-h-[100px]"
                placeholder="Please describe your reason..."
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card className="bg-card border-border md:col-span-2 transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-foreground">My Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Admin Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id} className="border-border hover:bg-accent/40">
                    <TableCell className="font-medium text-foreground">{leave.leaveType}</TableCell>
                    <TableCell className="text-foreground text-sm">
                      {leave.startDate}
                      <br />
                      <span className="text-muted-foreground">to</span> {leave.endDate}
                    </TableCell>
                    <TableCell>{statusBadge(leave.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {leave.adminComment || "--"}
                    </TableCell>
                  </TableRow>
                ))}
                {leaves.length === 0 && (
                  <TableRow className="border-border">
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No leave history yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

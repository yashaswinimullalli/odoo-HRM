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
      Approved: "border-green-500 text-green-400",
      Rejected: "border-red-500 text-red-400",
      Pending: "border-orange-500 text-orange-400",
    };
    return (
      <Badge variant="outline" className={map[status] ?? "border-zinc-500 text-zinc-400"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Apply Form */}
      <Card className="bg-zinc-900 border-zinc-800 md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="text-white">Apply for Leave</CardTitle>
          <CardDescription className="text-zinc-400">Submit a new time-off request.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Leave Type</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(v) => setFormData((p) => ({ ...p, leaveType: v as LeaveRecord["leaveType"] }))}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="Paid Leave">Paid Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Start Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">End Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Reason / Remarks</Label>
              <Textarea
                required
                value={formData.remarks}
                onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600 min-h-[100px]"
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
      <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">My Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-400">Duration</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Admin Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-300">{leave.leaveType}</TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {leave.startDate}
                      <br />
                      <span className="text-zinc-500">to</span> {leave.endDate}
                    </TableCell>
                    <TableCell>{statusBadge(leave.status)}</TableCell>
                    <TableCell className="text-zinc-400 text-sm max-w-[200px] truncate">
                      {leave.adminComment || "--"}
                    </TableCell>
                  </TableRow>
                ))}
                {leaves.length === 0 && (
                  <TableRow className="border-zinc-800">
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-8">
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

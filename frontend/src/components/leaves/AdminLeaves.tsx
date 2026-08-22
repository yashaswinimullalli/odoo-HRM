"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAllLeaves, updateLeaveStatus } from "@/lib/mockStore";
import { LeaveRecord } from "@/lib/types";

export function AdminLeaves() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  useEffect(() => {
    setLeaves(getAllLeaves());
  }, []);

  const handleAction = (status: "Approved" | "Rejected") => {
    if (!selectedLeave) return;
    setActionLoading(true);
    setTimeout(() => {
      updateLeaveStatus(selectedLeave.id, status, adminComment);
      setLeaves(getAllLeaves());
      toast.success(`Leave request ${status.toLowerCase()}.`);
      setSelectedLeave(null);
      setAdminComment("");
      setActionLoading(false);
    }, 500);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Approved: "border-green-500 text-green-400",
      Rejected: "border-red-500 text-red-400",
      Pending: "border-orange-500 text-orange-400",
    };
    return <Badge variant="outline" className={map[status] ?? "border-zinc-500"}>{status}</Badge>;
  };

  const filtered = filter === "All" ? leaves : leaves.filter((l) => l.status === filter);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["All", "Pending", "Approved", "Rejected"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className={
              filter === f
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Employee</TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-400">Duration</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((leave) => (
                  <TableRow key={leave.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell>
                      <div className="font-medium text-white">{leave.employeeName}</div>
                      <div className="text-xs text-zinc-500">{leave.employeeId}</div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{leave.leaveType}</TableCell>
                    <TableCell className="text-zinc-300 text-sm whitespace-nowrap">
                      {leave.startDate} <span className="text-zinc-500">→</span> {leave.endDate}
                    </TableCell>
                    <TableCell>{statusBadge(leave.status)}</TableCell>
                    <TableCell className="text-right">
                      {leave.status === "Pending" ? (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          Review
                        </Button>
                      ) : (
                        <span className="text-sm text-zinc-600">Done</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow className="border-zinc-800">
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                      No {filter.toLowerCase()} requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={(o) => !o && setSelectedLeave(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedLeave?.employeeName} · {selectedLeave?.leaveType}
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Duration</p>
                  <p className="font-medium">{selectedLeave.startDate} to {selectedLeave.endDate}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Leave Type</p>
                  <p className="font-medium">{selectedLeave.leaveType}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-zinc-500 text-xs mb-1">Employee Reason</p>
                  <p className="p-3 bg-zinc-950 rounded-md border border-zinc-800 text-zinc-300 text-sm">
                    {selectedLeave.remarks}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Comment (Optional)</label>
                <Textarea
                  placeholder="Add a note for the employee..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => handleAction("Rejected")}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAction("Approved")}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

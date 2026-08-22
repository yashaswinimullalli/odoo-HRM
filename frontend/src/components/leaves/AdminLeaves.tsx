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
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { LeaveRecord } from "@/lib/types";

export function AdminLeaves() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  const loadLeaves = async () => {
    setTableLoading(true);
    try {
      const data = await api.getAllLeaves(filter === "All" ? undefined : filter);
      setLeaves(data || []);
    } catch (err: any) {
      console.warn("[AdminLeaves] Error loading leaves:", err);
      toast.error(err.message || "Failed to load leave requests.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [filter]);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await api.reviewLeave(selectedLeave.id, status, adminComment.trim() || undefined);
      toast.success(`Leave request ${status === "APPROVED" ? "approved" : "rejected"} successfully.`);
      setSelectedLeave(null);
      setAdminComment("");
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || "Failed to update leave status.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Approved: "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10",
      Rejected: "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10",
      Pending: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    };
    return <Badge variant="outline" className={map[status] ?? "border-border text-muted-foreground"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["All", "Pending", "Approved", "Rejected"] as const).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={filter === tab ? "default" : "outline"}
            onClick={() => setFilter(tab)}
            className={`text-xs h-8 ${
              filter === tab
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "border-border text-foreground hover:bg-accent"
            }`}
          >
            {tab} {tab === "Pending" && leaves.filter((l) => l.status === "Pending").length > 0 && `(${leaves.filter((l) => l.status === "Pending").length})`}
          </Button>
        ))}
      </div>

      <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">Leave Requests</CardTitle>
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
                    <TableHead className="text-muted-foreground text-xs">Employee</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Duration</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id} className="border-border hover:bg-accent/40 text-xs">
                      <TableCell>
                        <div className="font-semibold text-foreground">{leave.employeeName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{leave.employeeId}</div>
                      </TableCell>
                      <TableCell className="text-foreground">{leave.leaveType}</TableCell>
                      <TableCell className="text-foreground whitespace-nowrap">
                        {leave.startDate} <span className="text-muted-foreground">→</span> {leave.endDate}
                      </TableCell>
                      <TableCell>{statusBadge(leave.status)}</TableCell>
                      <TableCell className="text-right">
                        {leave.status === "Pending" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-600/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600/10 text-xs h-7"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setAdminComment("");
                            }}
                          >
                            Review
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">Reviewed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaves.length === 0 && (
                    <TableRow className="border-border">
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-xs">
                        No leave requests found for this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Review Leave Request</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {selectedLeave?.employeeName} ({selectedLeave?.employeeId}) · {selectedLeave?.leaveType}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs">
            <div className="bg-muted/50 p-3 rounded-lg border border-border space-y-1">
              <p className="font-medium text-foreground">
                Dates: {selectedLeave?.startDate} to {selectedLeave?.endDate}
              </p>
              <p className="text-muted-foreground">Reason: {selectedLeave?.remarks}</p>
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Reviewer Note / Comment</label>
              <Textarea
                placeholder="Optional feedback or reason for decision..."
                className="bg-background border-border text-foreground text-xs min-h-[80px]"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => handleAction("REJECTED")}
              className="border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              disabled={actionLoading}
              onClick={() => handleAction("APPROVED")}
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
              Approve Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

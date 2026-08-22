"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, CheckCircle2, XCircle, Search, Calendar, User } from "lucide-react";
import { api } from "@/lib/api";
import { LeaveRecord } from "@/lib/types";

export function AdminLeaves() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [searchTerm, setSearchTerm] = useState("");

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
    return (
      <Badge variant="outline" className={map[status] ?? "border-border text-muted-foreground text-xs"}>
        {status}
      </Badge>
    );
  };

  const filteredLeaves = leaves.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.employeeName.toLowerCase().includes(term) ||
      l.employeeId.toLowerCase().includes(term) ||
      l.leaveType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Approvals</h1>
          <p className="text-muted-foreground text-xs">Review, approve, or reject employee time-off applications.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card border-border text-foreground text-xs h-9"
          />
        </div>
      </div>

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
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                : "border-border text-foreground hover:bg-accent"
            }`}
          >
            {tab}{" "}
            {tab === "Pending" &&
              leaves.filter((l) => l.status === "Pending").length > 0 &&
              `(${leaves.filter((l) => l.status === "Pending").length})`}
          </Button>
        ))}
      </div>

      {/* Main Content Card */}
      <Card className="bg-card border-border transition-colors duration-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-foreground text-base">
            Leave Requests ({filteredLeaves.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {tableLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-md border border-border overflow-x-auto">
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
                    {filteredLeaves.map((leave) => (
                      <TableRow key={leave.id} className="border-border hover:bg-accent/40 text-xs">
                        <TableCell>
                          <div className="font-semibold text-foreground">{leave.employeeName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{leave.employeeId}</div>
                        </TableCell>
                        <TableCell className="text-foreground font-medium">{leave.leaveType}</TableCell>
                        <TableCell className="text-foreground whitespace-nowrap">
                          {leave.startDate} <span className="text-muted-foreground">→</span> {leave.endDate}
                        </TableCell>
                        <TableCell>{statusBadge(leave.status)}</TableCell>
                        <TableCell className="text-right">
                          {leave.status === "Pending" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-600/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600/10 text-xs h-8 px-3"
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
                    {filteredLeaves.length === 0 && (
                      <TableRow className="border-border">
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-10 text-xs">
                          No leave requests match your search or filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Responsive Cards View */}
              <div className="block sm:hidden divide-y divide-border">
                {filteredLeaves.map((leave) => (
                  <div key={leave.id} className="p-4 space-y-3 bg-card hover:bg-accent/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{leave.employeeName}</h4>
                        <p className="text-[11px] text-muted-foreground font-mono">{leave.employeeId}</p>
                      </div>
                      {statusBadge(leave.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/40">
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase">Type</span>
                        <span className="font-medium text-foreground">{leave.leaveType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase">Duration</span>
                        <span className="text-foreground whitespace-nowrap">
                          {leave.startDate} <span className="text-muted-foreground">→</span> {leave.endDate}
                        </span>
                      </div>
                    </div>

                    {leave.status === "Pending" && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-9"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setAdminComment("");
                          }}
                        >
                          Review Request
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredLeaves.length === 0 && (
                  <div className="text-center text-muted-foreground py-12 px-4 text-xs">
                    No leave requests match your filter.
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        <DialogContent className="bg-card border-border text-foreground w-[92vw] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg">Review Leave Request</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {selectedLeave?.employeeName} ({selectedLeave?.employeeId}) · {selectedLeave?.leaveType}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs mt-2">
            <div className="bg-muted/50 p-3.5 rounded-xl border border-border space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Calendar className="h-3.5 w-3.5 text-purple-600" />
                <span>{selectedLeave?.startDate} to {selectedLeave?.endDate}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                <strong className="text-foreground">Reason:</strong> {selectedLeave?.remarks || "No specific reason provided."}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs">Reviewer Note / Feedback</label>
              <Textarea
                placeholder="Optional feedback or reason for decision..."
                className="bg-background border-border text-foreground text-xs min-h-[90px] rounded-lg"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => handleAction("REJECTED")}
              className="border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs h-9 w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Reject Request
            </Button>
            <Button
              size="sm"
              disabled={actionLoading}
              onClick={() => handleAction("APPROVED")}
              className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 w-full sm:w-auto font-medium"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
              )}
              Approve Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

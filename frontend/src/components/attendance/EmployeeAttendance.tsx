"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AttendanceRecord } from "@/lib/types";

export function EmployeeAttendance() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const loadAttendanceData = async () => {
    try {
      setPageLoading(true);
      const list = await api.getMyAttendance("all");
      setRecords(list || []);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayMatch = (list || []).find((r) => r.date === todayStr);
      setTodayRecord(todayMatch || null);
    } catch (err: any) {
      console.warn("[Attendance] Error loading attendance:", err);
      toast.error(err.message || "Failed to load attendance records.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadAttendanceData();
    }
  }, [profile]);

  const handleCheckIn = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const record = await api.checkIn();
      setTodayRecord(record);
      toast.success(`Checked in successfully at ${record.checkInTime || "now"}!`);
      loadAttendanceData();
    } catch (err: any) {
      toast.error(err.message || "Check-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;
    setLoading(true);
    try {
      const record = await api.checkOut();
      setTodayRecord(record);
      toast.success(`Checked out at ${record.checkOutTime || "now"} (${record.totalWorkingHours || "0"} hrs)`);
      loadAttendanceData();
    } catch (err: any) {
      toast.error(err.message || "Check-out failed.");
    } finally {
      setLoading(false);
    }
  };

  const statusClass = (s: string) =>
    s === "Present" ? "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10"
    : s === "Half-day" ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10"
    : s === "Leave" ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10"
    : "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10";

  return (
    <div className="space-y-6">
      {/* Check in/out Live Card */}
      <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-foreground">
                  {format(new Date(), "EEEE, MMMM do, yyyy")}
                </h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-6 text-xs text-muted-foreground">
                <div>
                  Check In:{" "}
                  <span className="text-foreground font-semibold font-mono">
                    {todayRecord?.checkInTime ?? "--:--"}
                  </span>
                </div>
                <div>
                  Check Out:{" "}
                  <span className="text-foreground font-semibold font-mono">
                    {todayRecord?.checkOutTime ?? "--:--"}
                  </span>
                </div>
                <div>
                  Working Hours:{" "}
                  <span className="text-foreground font-semibold">
                    {todayRecord?.totalWorkingHours
                      ? `${todayRecord.totalWorkingHours} hrs`
                      : "--"}
                  </span>
                </div>
                <div>
                  Status:{" "}
                  {todayRecord ? (
                    <Badge variant="outline" className={statusClass(todayRecord.status)}>
                      {todayRecord.status}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Not Checked In</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={loading || !!todayRecord?.checkInTime}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 min-w-[120px]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {todayRecord?.checkInTime ? "Checked In" : "Check In"}
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={loading || !todayRecord?.checkInTime || !!todayRecord?.checkOutTime}
                variant="outline"
                className="border-border text-foreground hover:bg-accent gap-2 min-w-[120px]"
              >
                <LogOut className="h-4 w-4" />
                {todayRecord?.checkOutTime ? "Checked Out" : "Check Out"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table from Neon Database */}
      <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-base">My Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {pageLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Check In</TableHead>
                    <TableHead className="text-muted-foreground">Check Out</TableHead>
                    <TableHead className="text-muted-foreground">Working Hours</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((rec) => (
                    <TableRow key={rec.id} className="border-border hover:bg-accent/40">
                      <TableCell className="font-medium text-foreground">{rec.date}</TableCell>
                      <TableCell className="text-foreground font-mono">{rec.checkInTime ?? "--"}</TableCell>
                      <TableCell className="text-foreground font-mono">{rec.checkOutTime ?? "--"}</TableCell>
                      <TableCell className="text-foreground">
                        {rec.totalWorkingHours ? `${rec.totalWorkingHours} hrs` : "--"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass(rec.status)}>
                          {rec.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {records.length === 0 && (
                    <TableRow className="border-border">
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        No attendance records logged yet. Use the Check In button above.
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

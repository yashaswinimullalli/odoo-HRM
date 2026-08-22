"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  getAttendanceByUser,
  getTodayAttendance,
  checkIn,
  checkOut,
} from "@/lib/mockStore";
import { AttendanceRecord } from "@/lib/types";

export function EmployeeAttendance() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setRecords(getAttendanceByUser(profile.uid));
    setTodayRecord(getTodayAttendance(profile.uid) ?? null);
  }, [profile]);

  const handleCheckIn = () => {
    if (!profile) return;
    setLoading(true);
    setTimeout(() => {
      const record = checkIn(profile.uid, profile);
      setTodayRecord(record);
      setRecords(getAttendanceByUser(profile.uid));
      toast.success(`Checked in at ${record.checkInTime}`);
      setLoading(false);
    }, 500);
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    setLoading(true);
    setTimeout(() => {
      const updated = checkOut(todayRecord.id);
      setTodayRecord(updated);
      setRecords(getAttendanceByUser(profile!.uid));
      toast.success(`Checked out · ${updated.totalWorkingHours} hrs worked`);
      setLoading(false);
    }, 500);
  };

  const statusClass = (s: string) =>
    s === "Present" ? "border-green-500 text-green-400"
    : s === "Half-day" ? "border-orange-500 text-orange-400"
    : s === "Leave" ? "border-purple-500 text-purple-400"
    : "border-red-500 text-red-400";

  return (
    <div className="space-y-6">
      {/* Check in/out card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </h2>
              <div className="mt-2 flex gap-6 text-sm text-zinc-400">
                <div>
                  Check In:{" "}
                  <span className="text-white font-medium">
                    {todayRecord?.checkInTime ?? "--:--"}
                  </span>
                </div>
                <div>
                  Check Out:{" "}
                  <span className="text-white font-medium">
                    {todayRecord?.checkOutTime ?? "--:--"}
                  </span>
                </div>
                <div>
                  Hours:{" "}
                  <span className="text-white font-medium">
                    {todayRecord?.totalWorkingHours
                      ? `${todayRecord.totalWorkingHours} hrs`
                      : "--"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={loading || !!todayRecord}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 w-32"
              >
                <LogIn className="h-4 w-4" />
                Check In
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={loading || !todayRecord || !!todayRecord.checkOutTime}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 w-32"
              >
                <LogOut className="h-4 w-4" />
                Check Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Check In</TableHead>
                  <TableHead className="text-zinc-400">Check Out</TableHead>
                  <TableHead className="text-zinc-400">Working Hours</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-white">{rec.date}</TableCell>
                    <TableCell className="text-zinc-300">{rec.checkInTime ?? "--"}</TableCell>
                    <TableCell className="text-zinc-300">{rec.checkOutTime ?? "--"}</TableCell>
                    <TableCell className="text-zinc-300">
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
                  <TableRow className="border-zinc-800">
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                      No attendance records found.
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

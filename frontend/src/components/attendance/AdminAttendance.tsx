"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { getAttendanceByDate } from "@/lib/mockStore";
import { AttendanceRecord } from "@/lib/types";

export function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    setRecords(getAttendanceByDate(dateFilter));
  }, [dateFilter]);

  const filtered = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusClass = (s: string) =>
    s === "Present" ? "border-green-500 text-green-400"
    : s === "Half-day" ? "border-orange-500 text-orange-400"
    : s === "Leave" ? "border-purple-500 text-purple-400"
    : "border-red-500 text-red-400";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <CardTitle className="text-white">Attendance Records</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search employee..."
              className="pl-8 bg-zinc-950 border-zinc-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Input
            type="date"
            className="bg-zinc-950 border-zinc-800 text-zinc-300"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-zinc-800">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Employee ID</TableHead>
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">In</TableHead>
                <TableHead className="text-zinc-400">Out</TableHead>
                <TableHead className="text-zinc-400">Hours</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rec) => (
                <TableRow key={rec.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-400">{rec.employeeId}</TableCell>
                  <TableCell className="font-medium text-white">{rec.employeeName}</TableCell>
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
              {filtered.length === 0 && (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    No records for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

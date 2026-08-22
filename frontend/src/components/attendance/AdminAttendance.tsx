"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { AttendanceRecord } from "@/lib/types";

export function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getAllAttendance(dateFilter);
      setRecords(data || []);
    } catch (err) {
      console.warn("[AdminAttendance] Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [dateFilter]);

  const filtered = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusClass = (s: string) =>
    s === "Present" ? "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10"
    : s === "Half-day" ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10"
    : s === "Leave" ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10"
    : "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10";

  return (
    <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <CardTitle className="text-foreground text-base">Attendance Records</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee..."
              className="pl-8 bg-background border-border text-foreground text-xs h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Input
            type="date"
            className="bg-background border-border text-foreground text-xs h-9"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Employee ID</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Employee Name</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Check In</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Check Out</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Working Hours</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((rec) => (
                  <TableRow key={rec.id} className="border-border hover:bg-accent/40 text-xs">
                    <TableCell className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{rec.employeeId}</TableCell>
                    <TableCell className="font-medium text-foreground">{rec.employeeName}</TableCell>
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
                {filtered.length === 0 && (
                  <TableRow className="border-border">
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-xs">
                      No attendance records logged for {dateFilter}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

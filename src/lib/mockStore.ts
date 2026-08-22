/**
 * Mock Store — In-memory "database" that persists for the browser session.
 * This simulates API calls and allows create/update operations without Firebase.
 * Replace these functions with real API calls when the backend is ready.
 */
import {
  MOCK_USERS,
  MOCK_ATTENDANCE,
  MOCK_LEAVES,
  MOCK_PAYROLL,
  MOCK_NOTIFICATIONS,
} from "./mockData";
import {
  UserProfile,
  AttendanceRecord,
  LeaveRecord,
  PayrollRecord,
  Notification,
} from "./types";
import { format } from "date-fns";

// In-memory state (lives for session duration)
let users: UserProfile[] = JSON.parse(JSON.stringify(MOCK_USERS));
let attendance: AttendanceRecord[] = JSON.parse(JSON.stringify(MOCK_ATTENDANCE));
let leaves: LeaveRecord[] = JSON.parse(JSON.stringify(MOCK_LEAVES));
let payroll: PayrollRecord[] = JSON.parse(JSON.stringify(MOCK_PAYROLL));
let notifications: Notification[] = JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS));

const genId = () => Math.random().toString(36).substring(2, 10);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const mockLogin = (
  email: string,
  password: string
): UserProfile | null => {
  // Any password works for demo (password = "password" for all users)
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user ?? null;
};

export const mockRegister = (data: {
  fullName: string;
  employeeId: string;
  email: string;
  role: "admin" | "employee";
}): UserProfile => {
  const newUser: UserProfile = {
    uid: `user-${genId()}`,
    fullName: data.fullName,
    employeeId: data.employeeId,
    email: data.email,
    role: data.role,
    emailVerified: false,
  };
  users.push(newUser);
  return newUser;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAllEmployees = (): UserProfile[] =>
  users.filter((u) => u.role === "employee");

export const getUserById = (uid: string): UserProfile | undefined =>
  users.find((u) => u.uid === uid);

export const updateUser = (uid: string, data: Partial<UserProfile>): UserProfile => {
  const idx = users.findIndex((u) => u.uid === uid);
  users[idx] = { ...users[idx], ...data };
  return users[idx];
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const getAttendanceByUser = (uid: string): AttendanceRecord[] =>
  attendance
    .filter((a) => a.userId === uid)
    .sort((a, b) => b.date.localeCompare(a.date));

export const getAttendanceByDate = (date: string): AttendanceRecord[] =>
  attendance.filter((a) => a.date === date);

export const getTodayAttendance = (uid: string): AttendanceRecord | undefined => {
  const today = format(new Date(), "yyyy-MM-dd");
  return attendance.find((a) => a.userId === uid && a.date === today);
};

export const checkIn = (uid: string, profile: UserProfile): AttendanceRecord => {
  const today = format(new Date(), "yyyy-MM-dd");
  const time = format(new Date(), "HH:mm");
  const record: AttendanceRecord = {
    id: `att-${genId()}`,
    userId: uid,
    employeeId: profile.employeeId,
    employeeName: profile.fullName,
    date: today,
    checkInTime: time,
    checkOutTime: null,
    totalWorkingHours: null,
    status: "Present",
  };
  attendance.push(record);
  return record;
};

export const checkOut = (recordId: string): AttendanceRecord => {
  const idx = attendance.findIndex((a) => a.id === recordId);
  const record = attendance[idx];
  const now = new Date();
  const checkInDate = new Date(`${record.date}T${record.checkInTime}`);
  const diffHours = ((now.getTime() - checkInDate.getTime()) / 3600000).toFixed(2);
  const status: AttendanceRecord["status"] =
    parseFloat(diffHours) < 4 ? "Half-day" : "Present";
  attendance[idx] = {
    ...record,
    checkOutTime: format(now, "HH:mm"),
    totalWorkingHours: diffHours,
    status,
  };
  return attendance[idx];
};

// ─── Leaves ───────────────────────────────────────────────────────────────────

export const getLeavesByUser = (uid: string): LeaveRecord[] =>
  leaves
    .filter((l) => l.userId === uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getAllLeaves = (): LeaveRecord[] =>
  [...leaves].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const applyLeave = (
  uid: string,
  profile: UserProfile,
  data: { leaveType: LeaveRecord["leaveType"]; startDate: string; endDate: string; remarks: string }
): LeaveRecord => {
  const record: LeaveRecord = {
    id: `lv-${genId()}`,
    userId: uid,
    employeeId: profile.employeeId,
    employeeName: profile.fullName,
    ...data,
    status: "Pending",
    adminComment: "",
    createdAt: new Date().toISOString(),
  };
  leaves.push(record);
  return record;
};

export const updateLeaveStatus = (
  leaveId: string,
  status: "Approved" | "Rejected",
  adminComment: string
): LeaveRecord => {
  const idx = leaves.findIndex((l) => l.id === leaveId);
  leaves[idx] = { ...leaves[idx], status, adminComment };

  // Create in-app notification
  const leaf = leaves[idx];
  notifications.push({
    id: `notif-${genId()}`,
    userId: leaf.userId,
    title: `Leave Request ${status}`,
    message: `Your ${leaf.leaveType} request from ${leaf.startDate} to ${leaf.endDate} has been ${status.toLowerCase()}.${adminComment ? " Comment: " + adminComment : ""}`,
    type: "leave_update",
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return leaves[idx];
};

// ─── Payroll ──────────────────────────────────────────────────────────────────

export const getPayrollByUser = (uid: string): PayrollRecord[] =>
  payroll
    .filter((p) => p.userId === uid)
    .sort((a, b) => b.month.localeCompare(a.month));

export const getAllPayroll = (): PayrollRecord[] =>
  [...payroll].sort((a, b) => b.month.localeCompare(a.month));

export const createPayroll = (
  userId: string,
  employeeId: string,
  data: { month: string; basicSalary: number; allowances: number; deductions: number }
): PayrollRecord => {
  const netSalary = data.basicSalary + data.allowances - data.deductions;
  const record: PayrollRecord = {
    id: `pay-${genId()}`,
    userId,
    employeeId,
    ...data,
    netSalary,
    createdAt: new Date().toISOString(),
  };
  payroll.push(record);
  return record;
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotificationsByUser = (uid: string): Notification[] =>
  notifications
    .filter((n) => n.userId === uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const markNotificationRead = (id: string) => {
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx > -1) notifications[idx].isRead = true;
};

export const getUnreadCount = (uid: string): number =>
  notifications.filter((n) => n.userId === uid && !n.isRead).length;

export type Role = "admin" | "employee";

export interface UserProfile {
  uid: string;
  fullName: string;
  employeeId: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  employmentType?: string;
  profilePicture?: string;
  emailVerified?: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalWorkingHours: string | null;
  status: "Present" | "Absent" | "Half-day" | "Leave";
}

export interface LeaveRecord {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  leaveType: "Paid Leave" | "Sick Leave" | "Unpaid Leave";
  startDate: string;
  endDate: string;
  remarks: string;
  status: "Pending" | "Approved" | "Rejected";
  adminComment: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  employeeId: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

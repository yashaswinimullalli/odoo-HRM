/**
 * Dayflow HRMS - Backend API Client
 * Connects Next.js Frontend to Node.js/Express + PostgreSQL Backend
 */

import { UserProfile, AttendanceRecord, LeaveRecord, PayrollRecord, Notification } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://odoo-hrm.onrender.com/api";
const TOKEN_KEY = "dayflow_auth_token";

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Universal fetch wrapper with Authorization header
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const primaryUrl = `${API_BASE_URL}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(primaryUrl, { ...options, headers });
  } catch (netErr: any) {
    // Automatic fallback for Windows when localhost (::1) is not bound
    if (primaryUrl.includes("localhost")) {
      const fallbackUrl = primaryUrl.replace("localhost", "127.0.0.1");
      try {
        response = await fetch(fallbackUrl, { ...options, headers });
      } catch {
        throw new Error("Unable to connect to the backend server. Please verify port 5000 is running.");
      }
    } else {
      throw netErr;
    }
  }

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

// ─── Transformer Helpers ──────────────────────────────────────────────────────

export function mapBackendUserToProfile(user: any): UserProfile {
  const emp = user.employee || {};
  const fullName = emp.first_name ? `${emp.first_name} ${emp.last_name || ""}`.trim() : (user.email.split("@")[0]);
  return {
    uid: String(user.id || user.user_id || emp.id),
    fullName,
    employeeId: emp.employee_code || user.employee_code || `EMP${String(user.id).padStart(3, "0")}`,
    email: user.email,
    role: (user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "hr") ? "admin" : "employee",
    department: emp.department_name || emp.department || "General",
    designation: emp.designation_title || emp.designation || "Specialist",
    joiningDate: emp.joining_date ? emp.joining_date.split("T")[0] : new Date().toISOString().split("T")[0],
    phone: emp.phone_number || "",
    address: emp.current_address || "",
    profilePicture: emp.profile_picture_url || "",
    emailVerified: user.is_verified ?? true,
  };
}

export function mapBackendAttendance(row: any): AttendanceRecord {
  const dateStr = row.date ? (typeof row.date === "string" ? row.date.split("T")[0] : new Date(row.date).toISOString().split("T")[0]) : "";
  let status: AttendanceRecord["status"] = "Present";
  if (row.status === "HALF_DAY") status = "Half-day";
  else if (row.status === "LEAVE") status = "Leave";
  else if (row.status === "ABSENT") status = "Absent";

  return {
    id: String(row.id),
    userId: String(row.employee_id || row.user_id),
    employeeId: row.employee_code || `EMP${row.employee_id}`,
    employeeName: row.employee_name || "Employee",
    date: dateStr,
    checkInTime: row.check_in ? (typeof row.check_in === "string" ? row.check_in.substring(11, 16) : new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : null,
    checkOutTime: row.check_out ? (typeof row.check_out === "string" ? row.check_out.substring(11, 16) : new Date(row.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : null,
    totalWorkingHours: row.working_hours ? `${row.working_hours}h` : null,
    status,
  };
}

export function mapBackendLeave(row: any): LeaveRecord {
  let leaveType: LeaveRecord["leaveType"] = "Paid Leave";
  if (row.leave_type === "SICK") leaveType = "Sick Leave";
  else if (row.leave_type === "UNPAID") leaveType = "Unpaid Leave";

  let status: LeaveRecord["status"] = "Pending";
  if (row.status === "APPROVED") status = "Approved";
  else if (row.status === "REJECTED") status = "Rejected";

  return {
    id: String(row.id),
    userId: String(row.employee_id),
    employeeId: row.employee_code || `EMP${row.employee_id}`,
    employeeName: row.employee_name || "Employee",
    leaveType,
    startDate: row.start_date ? row.start_date.split("T")[0] : "",
    endDate: row.end_date ? row.end_date.split("T")[0] : "",
    remarks: row.reason || "",
    status,
    adminComment: row.reviewer_comment || "",
    createdAt: row.created_at ? row.created_at.split("T")[0] : "",
  };
}

// ─── API Endpoints ───────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await request<{ success: boolean; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return mapBackendUserToProfile(res.user);
  },

  register: async (data: { fullName: string; employeeId: string; email: string; role: string; password?: string }) => {
    const [firstName, ...rest] = data.fullName.split(" ");
    const lastName = rest.join(" ") || firstName;
    const res = await request<{ success: boolean; token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password || "Password@123",
        employee_code: data.employeeId,
        first_name: firstName,
        last_name: lastName,
        role: data.role.toUpperCase(),
      }),
    });
    setAuthToken(res.token);
    return mapBackendUserToProfile(res.user);
  },

  getMe: async () => {
    const res = await request<{ success: boolean; user: any }>("/auth/me");
    return mapBackendUserToProfile(res.user);
  },

  // Dashboards
  getAdminDashboard: async () => {
    return request<{ success: boolean; data: any }>("/dashboard/admin");
  },

  getEmployeeDashboard: async () => {
    return request<{ success: boolean; data: any }>("/dashboard/employee");
  },

  getAdminActionItems: async () => {
    return request<{ success: boolean; total_action_items: number; action_items: any }>("/dashboard/admin/action-items");
  },

  // Attendance
  getMyAttendance: async (view = "daily") => {
    const res = await request<{ success: boolean; attendance?: any[]; data?: any[] }>(`/attendance/my?view=${view}`);
    const list = res.attendance || res.data || [];
    return list.map(mapBackendAttendance);
  },

  getAllAttendance: async (date?: string) => {
    const query = date ? `?date=${date}` : "";
    const res = await request<{ success: boolean; attendance?: any[]; data?: any[] }>(`/attendance/all${query}`);
    const list = res.attendance || res.data || [];
    return list.map(mapBackendAttendance);
  },

  checkIn: async () => {
    const res = await request<{ success: boolean; attendance?: any; data?: any }>("/attendance/check-in", { method: "POST" });
    return mapBackendAttendance(res.attendance || res.data);
  },

  checkOut: async () => {
    const res = await request<{ success: boolean; attendance?: any; data?: any }>("/attendance/check-out", { method: "POST" });
    return mapBackendAttendance(res.attendance || res.data);
  },

  // Leaves
  getMyLeaves: async () => {
    const res = await request<{ success: boolean; leaves?: any[]; data?: any[] }>("/leaves/my");
    const list = res.leaves || res.data || [];
    return list.map(mapBackendLeave);
  },

  getAllLeaves: async (status?: string) => {
    const query = status ? `?status=${status.toUpperCase()}` : "";
    const res = await request<{ success: boolean; leaves?: any[]; data?: any[] }>(`/leaves${query}`);
    const list = res.leaves || res.data || [];
    return list.map(mapBackendLeave);
  },

  applyLeave: async (data: { leaveType: string; startDate: string; endDate: string; reason: string }) => {
    const typeMap: Record<string, string> = {
      "Paid Leave": "PAID",
      "Sick Leave": "SICK",
      "Unpaid Leave": "UNPAID",
      PAID: "PAID",
      SICK: "SICK",
      UNPAID: "UNPAID",
    };
    const res = await request<{ success: boolean; leave?: any; data?: any }>("/leaves", {
      method: "POST",
      body: JSON.stringify({
        leave_type: typeMap[data.leaveType] || "PAID",
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
      }),
    });
    return mapBackendLeave(res.leave || res.data);
  },

  reviewLeave: async (leaveId: string, status: "APPROVED" | "REJECTED", comment?: string) => {
    const res = await request<{ success: boolean; leave?: any; data?: any }>(`/leaves/${leaveId}/review`, {
      method: "PUT",
      body: JSON.stringify({ status, reviewer_comment: comment }),
    });
    return mapBackendLeave(res.leave || res.data);
  },

  // Payroll & Salary Slips
  getMyPayroll: async () => {
    const res = await request<{ success: boolean; payrolls?: any[]; data?: any[] }>("/payroll/my");
    const list = res.payrolls || res.data || [];
    return list.map((p) => ({
      id: String(p.id),
      userId: String(p.employee_id || ""),
      employeeId: p.employee_code || `EMP${p.employee_id || ""}`,
      month: p.month_name || `${p.month}/${p.year}`,
      basicSalary: parseFloat(p.basic_salary),
      allowances: parseFloat(p.allowances) + parseFloat(p.hra || 0),
      deductions: parseFloat(p.deductions),
      netSalary: parseFloat(p.net_salary),
      createdAt: p.created_at ? p.created_at.split("T")[0] : "",
      paymentStatus: p.payment_status,
      paymentDate: p.payment_date,
    }));
  },

  getAllPayrolls: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append("month", String(month));
    if (year) params.append("year", String(year));
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ success: boolean; payrolls?: any[]; data?: any[]; summary: any }>(`/payroll${query}`);
  },

  getSalarySlip: async (employeeId: string, month: number, year: number) => {
    return request<{ success: boolean; data: any }>(`/reports/payroll/${employeeId}/slip?month=${month}&year=${year}`);
  },

  // Notifications
  getMyNotifications: async () => {
    const res = await request<{ success: boolean; notifications?: any[]; data?: any[]; unread_count?: number }>("/notifications");
    const list = res.notifications || res.data || [];
    return {
      unreadCount: res.unread_count || list.filter((n: any) => !n.is_read).length,
      notifications: list.map((n: any) => ({
        id: String(n.id),
        userId: String(n.user_id),
        title: n.title,
        message: n.message,
        type: n.notification_type || "general",
        isRead: n.is_read,
        createdAt: n.created_at ? n.created_at.split("T")[0] : "",
      })),
    };
  },

  markNotificationRead: async (id: string) => {
    return request<{ success: boolean }>(`/notifications/${id}/read`, { method: "PUT" });
  },

  markAllNotificationsRead: async () => {
    return request<{ success: boolean }>("/notifications/read-all", { method: "PUT" });
  },

  // Employees
  getEmployees: async () => {
    const res = await request<{ success: boolean; employees?: any[]; data?: any[] }>("/employees");
    const list = res.employees || res.data || [];
    return list.map((e: any) => ({
      uid: String(e.id),
      fullName: `${e.first_name} ${e.last_name || ""}`.trim(),
      employeeId: e.employee_code,
      email: e.email,
      role: (e.user_role || e.role)?.toLowerCase() === "admin" ? "admin" : "employee",
      department: e.department_name || "General",
      designation: e.designation_title || "Specialist",
      joiningDate: e.joining_date ? (typeof e.joining_date === "string" ? e.joining_date.split("T")[0] : new Date(e.joining_date).toISOString().split("T")[0]) : "",
      phone: e.phone_number || e.phone || "",
      address: e.current_address || e.address || "",
      employmentType: e.employment_status || "Full-time",
      emailVerified: true,
    }));
  },

  getEmployeeById: async (id: string) => {
    const res = await request<{ success: boolean; employee?: any; data?: any }>(`/employees/${id}`);
    const e = res.employee || res.data || {};
    return {
      uid: String(e.id),
      fullName: `${e.first_name} ${e.last_name || ""}`.trim(),
      employeeId: e.employee_code,
      email: e.email,
      role: (e.user_role || e.role)?.toLowerCase() === "admin" ? "admin" : "employee",
      department: e.department_name || "General",
      designation: e.designation_title || "Specialist",
      joiningDate: e.joining_date ? (typeof e.joining_date === "string" ? e.joining_date.split("T")[0] : new Date(e.joining_date).toISOString().split("T")[0]) : "",
      phone: e.phone_number || e.phone || "",
      address: e.current_address || e.address || "",
      employmentType: e.employment_status || "Full-time",
      salaryStructure: e.salary_structure,
      documents: e.documents || [],
      emailVerified: true,
    };
  },
};

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Clock,
  Calendar,
  CreditCard,
  BarChart3,
  Bell,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  LogIn,
  Zap,
  Globe,
  Lock,
  Layers,
  FileText,
  UserCheck,
  TrendingUp,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin");
  const [demoFirstName, setDemoFirstName] = useState("John");
  const [demoLastName, setDemoLastName] = useState("Doe");
  const [demoCompany, setDemoCompany] = useState("Odoo India");
  const [demoYear, setDemoYear] = useState("2026");

  // Calculate live preview of Login ID based on formula
  const computeLoginId = () => {
    const words = demoCompany.trim().split(/\s+/);
    const prefix = (words.length >= 2 ? words[0][0] + words[1][0] : demoCompany.substring(0, 2) || "DF").toUpperCase();
    const f2 = (demoFirstName.replace(/[^a-zA-Z]/g, "").substring(0, 2) || "US").toUpperCase().padEnd(2, "X");
    const lClean = demoLastName.replace(/[^a-zA-Z]/g, "").toUpperCase();
    const l2 = lClean.length >= 2 ? lClean.substring(0, 2) : (lClean.length === 1 ? lClean + "X" : "XX");
    return `${prefix}${f2}${l2}${demoYear}0001`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-fuchsia-600/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-[800px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute top-[1600px] right-[-100px] w-[600px] h-[600px] bg-purple-700/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-float-delayed" />

      {/* ─── Navigation Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Dayflow Logo" className="h-9 w-9 object-contain drop-shadow" />
            <span className="text-xl font-bold tracking-tight text-white">
              Day<span className="text-purple-500">flow</span>{" "}
              <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/60 ml-1">
                HRMS
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#id-engine" className="hover:text-white transition-colors">Login ID Engine</a>
            <a href="#preview" className="hover:text-white transition-colors">Interactive Portal</a>
            <a href="#analytics" className="hover:text-white transition-colors">SQL Analytics</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs font-semibold px-3.5">
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white text-xs font-semibold px-4 shadow-lg shadow-purple-900/30">
                Register Company
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-medium mb-6 shadow-inner shadow-purple-900/30 animate-shimmer">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Enterprise People Operations & Workforce Intelligence</span>
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Automate Human Resources.{" "}
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Empower Every Employee.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          From automated <strong>Formula-Based Login ID Generation</strong> and biometric-grade attendance tracking, to 1-click leave approvals, instant payroll disbursements, and live SQL reporting.
        </p>

        {/* Hero CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold px-8 h-12 shadow-xl shadow-purple-900/40 text-sm tracking-wide gap-2">
              Launch Workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-700 bg-zinc-900/70 text-zinc-200 hover:bg-zinc-800 hover:text-white px-7 h-12 text-sm font-semibold gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              Sign Up Organization
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>Automated ID Generator: <code>[OIJODO20260001]</code></span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>Live PostgreSQL Aggregates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>RFC 4180 CSV Reports</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>Strict Role-Based Security</span>
          </div>
        </div>

        {/* ─── Hero UI Preview Mockup ────────────────────────────────────── */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-2xl p-2 bg-gradient-to-b from-purple-500/20 via-zinc-800/40 to-zinc-900/60 border border-purple-500/30 shadow-2xl glow-purple">
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-left">
              {/* Window Header */}
              <div className="bg-zinc-900/80 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-zinc-500 font-mono ml-2">Dayflow HRMS · Executive Command Center</span>
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">
                  ● System Online · v1.0.0
                </Badge>
              </div>

              {/* Window Body Mockup */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950/80">
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-medium">Total Active Headcount</p>
                  <p className="text-2xl font-bold text-white">48</p>
                  <p className="text-[11px] text-green-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +12% this quarter
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-medium">Present Today</p>
                  <p className="text-2xl font-bold text-green-400">42</p>
                  <p className="text-[11px] text-zinc-500">87.5% attendance rate</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-medium">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-400">3</p>
                  <p className="text-[11px] text-zinc-500">Leave applications</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-medium">Monthly Payroll Outlay</p>
                  <p className="text-2xl font-bold text-purple-400">₹32.4L</p>
                  <p className="text-[11px] text-purple-300/80">Disbursed on time</p>
                </div>

                {/* Main Content Area in Mockup */}
                <div className="md:col-span-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white">Recent Team Onboardings & Login IDs</h4>
                    <span className="text-xs text-purple-400 font-mono">Format: [OI][First2][Last2][Year][Serial]</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Aarav Sharma", id: "OIAASH20260001", dept: "Engineering", role: "Lead Engineer", status: "Active" },
                      { name: "Priya Menon", id: "OIPRME20260002", dept: "Human Resources", role: "HR Director", status: "Active" },
                      { name: "Diya Nair", id: "OIDINA20260003", dept: "Marketing", role: "Growth Specialist", status: "Active" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-purple-600/20 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                            {row.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{row.name}</p>
                            <p className="text-[10px] text-zinc-500">{row.role} · {row.dept}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">{row.id}</span>
                        <Badge variant="outline" className="border-green-500/40 text-green-400 text-[10px]">{row.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side Quick Actions in Mockup */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Live HR Actions</h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-orange-400" />
                        <span>Aarav S. requested Sick Leave</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-green-400" />
                        <span>98% On-time Check-ins</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/login" className="w-full mt-3">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                      Test Live In App
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Login ID Generation Engine Spotlight ────────────── */}
      <section id="id-engine" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="bg-purple-950/70 border-purple-500/30 text-purple-300 text-xs mb-3">
            Wireframe Logic in Action
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Automated Login ID Generation Engine
          </h2>
          <p className="mt-3 text-zinc-400 text-sm">
            Every team member receives an automatically formatted, tamper-proof ID following your organization&apos;s formula.
          </p>
        </div>

        {/* Live Interactive ID Calculator Card */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl glass-card border border-purple-500/20 shadow-2xl relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Input Controls */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Interactive ID Generator Simulator
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Company Name</label>
                <input
                  type="text"
                  value={demoCompany}
                  onChange={(e) => setDemoCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">First Name</label>
                  <input
                    type="text"
                    value={demoFirstName}
                    onChange={(e) => setDemoFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Last Name</label>
                  <input
                    type="text"
                    value={demoLastName}
                    onChange={(e) => setDemoLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Year of Joining</label>
                <input
                  type="number"
                  value={demoYear}
                  onChange={(e) => setDemoYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Live Calculated ID Display */}
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-center text-center space-y-4">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
                Generated Login ID
              </span>
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-600/40">
                <p className="font-mono text-2xl sm:text-3xl font-extrabold text-purple-300 tracking-wider">
                  {computeLoginId()}
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-[11px] pt-2 border-t border-zinc-800 text-zinc-400 font-mono">
                <div>
                  <span className="block font-bold text-white">{computeLoginId().substring(0, 2)}</span>
                  <span className="text-[9px] text-zinc-500">Company</span>
                </div>
                <div>
                  <span className="block font-bold text-white">{computeLoginId().substring(2, 6)}</span>
                  <span className="text-[9px] text-zinc-500">Name</span>
                </div>
                <div>
                  <span className="block font-bold text-white">{computeLoginId().substring(6, 10)}</span>
                  <span className="text-[9px] text-zinc-500">Year</span>
                </div>
                <div>
                  <span className="block font-bold text-white">{computeLoginId().substring(10)}</span>
                  <span className="text-[9px] text-zinc-500">Serial</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500">
                Employees can log in with this ID or their email at <Link href="/login" className="text-purple-400 underline">Sign In</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comprehensive HR Modules Grid (Bento Grid) ───────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-purple-950/70 border-purple-500/30 text-purple-300 text-xs mb-3">
            Complete Operations Suite
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Every Stage of the Employee Lifecycle
          </h2>
          <p className="mt-3 text-zinc-400 text-sm">
            High-speed, role-guarded modules designed to automate administrative overhead so you can focus on your people.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Attendance */}
          <div className="p-6 rounded-2xl glass-card hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-900/10 group">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Attendance & Hours Tracking</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Daily check-in / check-out with automatic working hours computation. Flags Half-Day vs Present dynamically based on policy hours.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> 1-Click Check-in & Check-out</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Daily & Weekly Log Breakdown</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Attendance Regularization by HR</li>
            </ul>
          </div>

          {/* Card 2: Leaves & Calendar */}
          <div className="p-6 rounded-2xl glass-card hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-900/10 group">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Leave Workflow & Sync</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Apply for Paid, Sick, and Unpaid leaves. Instant manager reviews automatically update attendance logs to &apos;LEAVE&apos; across date ranges.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-orange-400" /> Paid / Sick Balance Tracking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-orange-400" /> Instant Manager Approval & Remarks</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-orange-400" /> Auto-sync with Attendance Roster</li>
            </ul>
          </div>

          {/* Card 3: Payroll & Salary Slips */}
          <div className="p-6 rounded-2xl glass-card hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-900/10 group">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Payroll & Automated Salary Slips</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Configurable compensation structures (Basic, HRA, Allowances, PF/TDS Deductions, Net Pay). Generates downloadable salary slips with currency words.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /> Batch Monthly Payroll Processing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /> Structured Salary Slip Generator</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /> Net Salary in Indian Rupee Words</li>
            </ul>
          </div>

          {/* Card 4: Reports & CSV */}
          <div className="p-6 rounded-2xl glass-card hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-900/10 group">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">RFC 4180 CSV Reports & Exports</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Export attendance logs, leave histories, and payroll sheets directly to standardized CSV for payroll accounting and external compliance.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /> 1-Click CSV & Excel Export</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /> Custom Date & Department Filters</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /> Financial Audit Trails</li>
            </ul>
          </div>

          {/* Card 5: Notifications & Email */}
          <div className="p-6 rounded-2xl glass-card hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-900/10 group">
            <div className="p-3 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Alerts & Email Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              In-app notification badge counts paired with concurrent HTML email templates for leave submissions, manager decisions, and salary credits.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-400" /> Instant In-App Notification Center</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-400" /> Responsive HTML Email Templates</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-400" /> Safe Non-blocking Dev Fallback</li>
            </ul>
          </div>

          {/* Card 6: Role Based Access Control */}
          <div className="p-6 rounded-2xl glass-card hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-900/10 group">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Strict Multi-Tenant Security</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Cryptographic JWT sessions with strict middleware guards. Employees only access personal records; Admins maintain complete oversight.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-yellow-400" /> JWT Token Session Auth</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-yellow-400" /> bcrypt-10 Password Hashing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-yellow-400" /> Role Separation (Admin, HR, Employee)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Interactive Role Switcher Section ────────────────────────────── */}
      <section id="preview" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge className="bg-purple-950/70 border-purple-500/30 text-purple-300 text-xs mb-3">
            Live Interactive Playground
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="mt-3 text-zinc-400 text-sm">
            Toggle between the Executive HR Manager view and the Employee Self-Service portal.
          </p>

          {/* Switcher Buttons */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "admin"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Admin & HR Executive Portal
            </button>
            <button
              onClick={() => setActiveTab("employee")}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "employee"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Employee Self-Service Portal
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800">
          {activeTab === "admin" ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-white">HR Officer Command Deck</h3>
                  <p className="text-xs text-zinc-400">Total company roster, actionable approvals, and payroll orchestration.</p>
                </div>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 text-xs w-fit">
                  Role: ADMIN / HR
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[11px] text-zinc-400">Active Headcount</p>
                  <p className="text-xl font-bold text-white mt-0.5">48 Employees</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[11px] text-zinc-400">Departments</p>
                  <p className="text-xl font-bold text-white mt-0.5">6 Teams</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[11px] text-zinc-400">Pending Review</p>
                  <p className="text-xl font-bold text-yellow-400 mt-0.5">3 Requests</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[11px] text-zinc-400">Payroll Cycle</p>
                  <p className="text-xl font-bold text-green-400 mt-0.5">Processed</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Direct Employee Onboarding with ID Formula</p>
                    <p className="text-xs text-zinc-400">Create employee profiles with automatic credentials generation.</p>
                  </div>
                </div>
                <Link href="/login">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                    Try Admin Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Employee Personal Dashboard</h3>
                  <p className="text-xs text-zinc-400">Self-service attendance, leave balances, and downloadable monthly salary slips.</p>
                </div>
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30 text-xs w-fit">
                  Role: EMPLOYEE
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400">Today&apos;s Status</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-1">Checked In (09:12 AM)</Badge>
                  </div>
                  <Clock className="h-6 w-6 text-green-400" />
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400">Available Paid Leaves</p>
                    <p className="text-xl font-bold text-white mt-0.5">10 Days Left</p>
                  </div>
                  <Calendar className="h-6 w-6 text-orange-400" />
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400">Latest Net Salary</p>
                    <p className="text-xl font-bold text-purple-400 mt-0.5">₹87,500</p>
                  </div>
                  <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Sign In with Employee Login ID (EMP001)</p>
                    <p className="text-xs text-zinc-400">No admin access required. Instant attendance check-in.</p>
                  </div>
                </div>
                <Link href="/login">
                  <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs">
                    Try Employee Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Enterprise Numbers & Social Proof ────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <p className="text-3xl sm:text-4xl font-extrabold text-white">99.9%</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Uptime SLA Reliability</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-400">&lt; 2 min</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Company Onboarding Time</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <p className="text-3xl sm:text-4xl font-extrabold text-fuchsia-400">100%</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Statutory Tax & PF Accuracy</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <p className="text-3xl sm:text-4xl font-extrabold text-green-400">0s</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">CSV Export Latency</p>
          </div>
        </div>
      </section>

      {/* ─── Pricing Plans Section ───────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-purple-950/70 border-purple-500/30 text-purple-300 text-xs mb-3">
            Predictable Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Simple, Transparent Plans
          </h2>
          <p className="mt-3 text-zinc-400 text-sm">
            Choose the best plan for your company size with full database ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan 1: Starter */}
          <div className="p-7 rounded-2xl glass-card border border-zinc-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Starter / Demo</h3>
              <p className="text-xs text-zinc-400 mt-1">For testing and evaluation teams</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-white">₹0</span>
                <span className="text-xs text-zinc-500 ml-1">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Up to 15 Employees</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Daily Attendance Check-in</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Leave Application & Approvals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Auto-Generated Login IDs</li>
              </ul>
            </div>
            <Link href="/register" className="w-full mt-8">
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-xs font-semibold">
                Start Free Demo
              </Button>
            </Link>
          </div>

          {/* Plan 2: Business (Featured) */}
          <div className="p-7 rounded-2xl glass-card border-2 border-purple-500 relative flex flex-col justify-between shadow-2xl glow-purple bg-gradient-to-b from-purple-950/20 to-zinc-900/90">
            <Badge className="absolute -top-3 right-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-[10px] font-bold">
              MOST POPULAR
            </Badge>
            <div>
              <h3 className="text-lg font-bold text-white">Business Organization</h3>
              <p className="text-xs text-zinc-400 mt-1">For scaling startups and growth companies</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-white">₹499</span>
                <span className="text-xs text-zinc-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Unlimited Employees & Teams</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Automated Monthly Payroll & Slips</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> RFC 4180 CSV Reports & Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> HTML Email Alert Dispatcher</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Custom Company Logo & Branding</li>
              </ul>
            </div>
            <Link href="/register" className="w-full mt-8">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white text-xs font-semibold shadow-md shadow-purple-900/30">
                Register Organization Now
              </Button>
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="p-7 rounded-2xl glass-card border border-zinc-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Enterprise Dedicated</h3>
              <p className="text-xs text-zinc-400 mt-1">For multinational companies and conglomerates</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Dedicated PostgreSQL Cluster</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Custom Biometric Machine Integrations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Single Sign-On (SAML / Okta / Azure)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> 24/7 Dedicated Account Director</li>
              </ul>
            </div>
            <Link href="/login" className="w-full mt-8">
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-xs font-semibold">
                Contact Enterprise Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Call to Action Banner ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/50 via-fuchsia-900/30 to-zinc-950 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl glow-purple">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Modernize Your HR Operations?
            </h2>
            <p className="text-sm text-zinc-300">
              Join leading organizations using Dayflow HRMS to streamline employee attendance, leave management, and monthly payrolls.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200 font-bold px-8 h-12 text-sm shadow-xl">
                  Register Your Organization
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto text-white hover:bg-purple-900/40 text-sm font-semibold">
                  Sign In to Workspace →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Enterprise Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Dayflow Logo" className="h-7 w-7 object-contain" />
            <span className="text-base font-bold text-white">
              Dayflow <span className="text-purple-400 font-normal text-xs">HRMS</span>
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Dayflow HRMS Technologies. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs text-zinc-400 font-medium">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

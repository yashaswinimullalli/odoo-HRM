"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Shield, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter your email or employee ID and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${user.fullName}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (loginVal: string) => {
    setIdentifier(loginVal);
    setPassword("Password@123");
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black px-4 py-12 text-zinc-100 selection:bg-purple-600 selection:text-white overflow-hidden">
      {/* ─── Full-Bleed Video Background ──────────────────────────────── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-black pointer-events-none" style={{ zIndex: 0 }}>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[440px] mx-auto" style={{ zIndex: 1 }}>
        {/* ─── 1. Header / Branding ─────────────────────────────────────── */}
        <header
          className="text-center mb-8"
          style={{
            animation: "fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="dayflow-shimmer">Day</span>
              <span className="dayflow-shimmer-accent">flow</span>
            </h1>
            <span className="text-[10px] font-semibold tracking-wider text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-md">
              HRMS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Human Resource Management System
          </p>
        </header>

        {/* ─── 2. Main Login Card ───────────────────────────────────────── */}
        <section
          className="login-card rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-lg"
          style={{
            animation: "fadeSlideUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both",
          }}
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Sign In</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your credentials to access your workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Field 1: Email or Employee ID */}
            <div className="space-y-2">
              <Label
                htmlFor="identifier"
                className="text-xs font-medium text-zinc-300 block"
              >
                Email or Employee ID
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="e.g. EMP001 or admin@dayflow.demo"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-11 rounded-lg bg-white/[0.06] border-white/[0.1] px-3.5 text-sm text-white placeholder:text-zinc-500 focus-visible:border-violet-400/60 focus-visible:ring-1 focus-visible:ring-violet-400/40 transition-colors"
              />
            </div>

            {/* Field 2: Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-zinc-300 block"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg bg-white/[0.06] border-white/[0.1] pl-3.5 pr-11 text-sm text-white placeholder:text-zinc-500 focus-visible:border-violet-400/60 focus-visible:ring-1 focus-visible:ring-violet-400/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-3 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 hover:from-violet-500 hover:via-fuchsia-400 hover:to-rose-400 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-900/40 hover:-translate-y-px"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            {/* Sign Up Link */}
            <div className="pt-2 text-center text-xs text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-violet-400 hover:text-violet-300 font-medium ml-1 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </form>
        </section>

        {/* ─── Quick Demo Access ────────────────────────────────────────── */}
        <section
          className="mt-8 pt-6 border-t border-white/[0.08]"
          style={{
            animation: "fadeSlideUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both",
          }}
        >
          <p className="text-[11px] font-semibold text-zinc-400 tracking-wider text-center mb-3.5 uppercase">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillDemo("priya.menon@dayflow.demo")}
              className="group flex flex-col p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-violet-500/30 text-left transition-all backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-white mb-1">
                <Shield className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                <span className="text-xs font-semibold">Admin</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono truncate">
                admin@dayflow.demo
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("EMP001")}
              className="group flex flex-col p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-fuchsia-500/30 text-left transition-all backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-white mb-1">
                <User className="h-3.5 w-3.5 text-fuchsia-400 flex-shrink-0" />
                <span className="text-xs font-semibold">Employee</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                EMP001
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* ─── Entrance Animations ──────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-14px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .dayflow-shimmer {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #e2c6ff 25%,
            #ffffff 50%,
            #ffd6a0 75%,
            #ffffff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
        }
        .dayflow-shimmer-accent {
          background: linear-gradient(
            90deg,
            #a855f7 0%,
            #c084fc 25%,
            #e9d5ff 50%,
            #c084fc 75%,
            #a855f7 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .login-card {
          background: linear-gradient(
            145deg,
            rgba(20, 12, 28, 0.88) 0%,
            rgba(12, 8, 22, 0.94) 50%,
            rgba(20, 12, 28, 0.88) 100%
          );
          border: 1px solid rgba(139, 92, 246, 0.15);
          box-shadow:
            0 0 0 1px rgba(139, 92, 246, 0.06),
            0 8px 40px rgba(0, 0, 0, 0.5),
            0 0 80px -20px rgba(139, 92, 246, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .login-card:hover {
          border-color: rgba(139, 92, 246, 0.25);
          box-shadow:
            0 0 0 1px rgba(139, 92, 246, 0.1),
            0 12px 48px rgba(0, 0, 0, 0.55),
            0 0 100px -20px rgba(139, 92, 246, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .dayflow-shimmer {
            -webkit-text-fill-color: #ffffff;
          }
          .dayflow-shimmer-accent {
            -webkit-text-fill-color: #a855f7;
          }
        }
      `}</style>
    </main>
  );
}

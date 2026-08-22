"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Sparkles, Building2 } from "lucide-react";

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
      toast.error("Please enter your Login ID/Email and password.");
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
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-5">
        {/* App / Web Logo Container */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-600/10 border border-purple-500/20 mb-3 shadow-lg shadow-purple-900/20">
            <Building2 className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Day<span className="text-purple-500">flow</span> <span className="text-sm font-normal text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 ml-1">HRMS</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">Human Resource Management System</p>
        </div>

        {/* Sign In Card */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
          <CardHeader className="text-center pb-3">
            <h2 className="text-xl font-bold text-white">Sign in</h2>
            <p className="text-xs text-zinc-400">Access your organization portal</p>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-2">
              {/* Login Id / Email Field */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-zinc-300 font-medium text-sm">
                  Login Id/Email :-
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="e.g. OIJODO20220001 or email@dayflow.demo"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-purple-600 h-11"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 font-medium text-sm">
                  Password :-
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-purple-600 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              {/* SIGN IN Action Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold h-11 text-sm tracking-wide uppercase transition-all shadow-md shadow-purple-900/30"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                SIGN IN
              </Button>

              {/* Don't have an Account Link */}
              <div className="text-center text-sm text-zinc-400">
                Don&apos;t have an Account?{" "}
                <Link
                  href="/register"
                  className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <p className="text-[11px] text-zinc-500 text-center mb-2.5 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-purple-400" />
            Quick Demo Logins (Login ID or Email)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:bg-purple-950/30 hover:border-purple-600/40 text-xs py-4 flex flex-col items-start gap-0.5"
              onClick={() => fillDemo("priya.menon@dayflow.demo")}
            >
              <span className="font-semibold text-white">Admin (Email)</span>
              <span className="text-[10px] text-zinc-500">priya.menon@dayflow.demo</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:bg-purple-950/30 hover:border-purple-600/40 text-xs py-4 flex flex-col items-start gap-0.5"
              onClick={() => fillDemo("EMP001")}
            >
              <span className="font-semibold text-white">Employee (Login ID)</span>
              <span className="text-[10px] text-zinc-500">Login ID: EMP001</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: "admin" | "employee") => {
    if (role === "admin") {
      setEmail("admin@dayflow.com");
    } else {
      setEmail("james@dayflow.com");
    }
    setPassword("password");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Day<span className="text-purple-500">flow</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Every workday, perfectly aligned.</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@dayflow.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              <div className="text-center text-sm text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo credentials hint */}
        <Card className="bg-zinc-900/50 border-zinc-800 border-dashed">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 text-center mb-3 font-medium uppercase tracking-wider">
              Demo Accounts
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white text-xs"
                onClick={() => fillDemo("admin")}
              >
                Fill Admin
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white text-xs"
                onClick={() => fillDemo("employee")}
              >
                Fill Employee
              </Button>
            </div>
            <p className="text-xs text-zinc-600 text-center mt-2">Password: any value works</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

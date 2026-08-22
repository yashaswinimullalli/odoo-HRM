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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    password: "",
    role: "employee" as "admin" | "employee",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({
        fullName: formData.fullName,
        employeeId: formData.employeeId,
        email: formData.email,
        role: formData.role,
      });
      toast.success(`Account created! Welcome, ${user.fullName}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-4 py-12">
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
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-zinc-400">
              Register your details to get started.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-zinc-300">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-zinc-300">
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  required
                  placeholder="EMP006"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@dayflow.com"
                  value={formData.email}
                  onChange={handleChange}
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
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
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
              <div className="space-y-2">
                <Label className="text-zinc-300">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: v as "admin" | "employee",
                    }))
                  }
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:ring-purple-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin / HR Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <div className="text-center text-sm text-zinc-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

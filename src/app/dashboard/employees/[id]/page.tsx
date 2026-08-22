"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById, updateUser } from "@/lib/mockStore";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { profile: currentUser } = useAuth();

  const [empData, setEmpData] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.role === "admin" && params.id) {
      const found = getUserById(params.id as string);
      if (found) {
        setEmpData(found);
      } else {
        toast.error("Employee not found");
        router.push("/dashboard/employees");
      }
    }
  }, [currentUser, params.id, router]);

  if (currentUser?.role !== "admin") return null;
  if (!empData) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpData((prev: any) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser(empData.uid, empData);
      toast.success("Employee details updated.");
      setSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Employee Details</h1>
          <p className="text-zinc-400">Edit employee profile and job information.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Card */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-28 w-28 border-4 border-zinc-800">
              <AvatarImage src={empData.profilePicture} />
              <AvatarFallback className="bg-zinc-800 text-3xl text-white">
                {empData.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg text-white">{empData.fullName}</h3>
              <p className="text-zinc-400 text-sm">{empData.email}</p>
              <Badge variant="outline" className="mt-2 border-purple-600/50 text-purple-400">
                {empData.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Job Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Employee ID</Label>
                  <Input value={empData.employeeId} disabled className="bg-zinc-950 border-zinc-800 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-zinc-300">Department</Label>
                  <Input
                    id="department"
                    value={empData.department ?? ""}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-zinc-300">Designation</Label>
                  <Input
                    id="designation"
                    value={empData.designation ?? ""}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="text-zinc-300">Employment Type</Label>
                  <Input
                    id="employmentType"
                    value={empData.employmentType ?? ""}
                    onChange={handleChange}
                    placeholder="Full-time / Part-time"
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate" className="text-zinc-300">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={empData.joiningDate ?? ""}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800 text-zinc-300 focus-visible:ring-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">Phone</Label>
                  <Input
                    id="phone"
                    value={empData.phone ?? ""}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

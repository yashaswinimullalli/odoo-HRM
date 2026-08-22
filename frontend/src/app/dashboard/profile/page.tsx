"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail, Phone, MapPin, Briefcase, CalendarDays, Building2 } from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ phone: "", address: "" });

  useEffect(() => {
    if (profile) {
      setFormData({ phone: profile.phone ?? "", address: profile.address ?? "" });
    }
  }, [profile]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateProfile(formData);
      toast.success("Profile updated successfully!");
      setSaving(false);
    }, 500);
  };

  if (!profile) return null;

  const infoItems = [
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Building2, label: "Department", value: profile.department ?? "--" },
    { icon: Briefcase, label: "Designation", value: profile.designation ?? "--" },
    { icon: CalendarDays, label: "Joined", value: profile.joiningDate ?? "--" },
    { icon: Briefcase, label: "Employment", value: profile.employmentType ?? "--" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="text-zinc-400">View and manage your personal information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar / Summary Card */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-28 w-28 border-4 border-zinc-800">
              <AvatarImage src={profile.profilePicture} />
              <AvatarFallback className="bg-zinc-800 text-3xl text-white">
                {profile.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg text-white">{profile.fullName}</h3>
              <p className="text-zinc-400 text-sm">{profile.designation ?? "Employee"}</p>
              <Badge variant="outline" className="mt-2 border-purple-600/50 text-purple-400 capitalize">
                {profile.role}
              </Badge>
            </div>
            <div className="w-full pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Employee ID</span>
                <span className="text-white font-medium">{profile.employeeId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Department</span>
                <span className="text-white font-medium">{profile.department ?? "--"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details + Edit */}
        <div className="md:col-span-2 space-y-6">
          {/* Read-only info */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Job Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infoItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Icon className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                      <span className="text-zinc-500 w-28 flex-shrink-0">{item.label}</span>
                      <span className="text-zinc-200">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Editable fields */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Contact Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-zinc-300">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+1 555-0000"
                        className="pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-zinc-300">
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                        placeholder="123 Main St, City"
                        className="pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-purple-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
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
    </div>
  );
}

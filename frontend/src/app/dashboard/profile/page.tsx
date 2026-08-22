"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail, Phone, MapPin, Briefcase, CalendarDays, Building2, User, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ phone: "", address: "" });

  const loadLiveProfile = async () => {
    try {
      setLoading(true);
      const liveUser = await api.getMe();
      if (liveUser) {
        updateProfile(liveUser);
        setFormData({
          phone: liveUser.phone || "",
          address: liveUser.address || "",
        });
      }
    } catch (err: any) {
      console.warn("[Profile] Error fetching live profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateMyProfile({
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      if (res.success) {
        updateProfile({
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        });
        toast.success("Profile contact details updated and saved to database.");
      } else {
        throw new Error(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile && loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) return null;

  const infoItems = [
    { icon: Mail, label: "Work Email", value: profile.email },
    { icon: Building2, label: "Department", value: profile.department ?? "Engineering" },
    { icon: Briefcase, label: "Designation", value: profile.designation ?? "Specialist" },
    { icon: CalendarDays, label: "Joining Date", value: profile.joiningDate ?? "--" },
    { icon: ShieldCheck, label: "Employment Status", value: profile.employmentType ?? "ACTIVE" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">View personal credentials and manage contact information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar / Summary Card */}
        <Card className="bg-card border-border md:col-span-1 h-fit transition-colors duration-200 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-28 w-28 border-4 border-border shadow-md bg-muted">
              <AvatarImage src={profile.profilePicture} />
              <AvatarFallback className="bg-muted text-3xl font-bold text-foreground">
                {(profile.fullName || "User").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg text-foreground">{profile.fullName}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{profile.designation ?? "Employee"}</p>
              <Badge variant="outline" className="mt-2 border-purple-600/40 text-purple-600 dark:text-purple-400 capitalize bg-purple-500/10 text-xs">
                {profile.role}
              </Badge>
            </div>
            <div className="w-full pt-4 border-t border-border space-y-2.5 text-xs text-left">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Login ID / Code</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{profile.employeeId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Department</span>
                <span className="text-foreground font-medium">{profile.department ?? "--"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Status</span>
                <Badge variant="outline" className="border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/10 text-[10px]">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details + Edit */}
        <div className="md:col-span-2 space-y-6">
          {/* Read-only Professional Info */}
          <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Professional & Job Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5">
                {infoItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm py-1 border-b border-border/50 last:border-0">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground w-36 flex-shrink-0 text-xs">{item.label}</span>
                      <span className="text-foreground font-medium text-xs sm:text-sm truncate">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Editable Contact Information */}
          <Card className="bg-card border-border transition-colors duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Contact & Residential Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground text-xs">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="pl-9 bg-background border-border text-foreground text-sm h-10 focus-visible:ring-purple-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-foreground text-xs">
                      Residential Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                        placeholder="123 Technology Road, Bengaluru"
                        className="pl-9 bg-background border-border text-foreground text-sm h-10 focus-visible:ring-purple-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-medium"
                  >
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

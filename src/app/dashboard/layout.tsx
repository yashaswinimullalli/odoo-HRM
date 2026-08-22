"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  if (loading || !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-zinc-900 p-6">{children}</main>
      </div>
    </div>
  );
}

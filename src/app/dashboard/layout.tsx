
import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ProtectRoute } from "@/components/auth/ProtectRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectRoute>
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            <Sidebar>
                <SidebarNav />
            </Sidebar>
            <div className="flex flex-col flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
                    {children}
                </main>
            </div>
        </div>
    </ProtectRoute>
  );
}

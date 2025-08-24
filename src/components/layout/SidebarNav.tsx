
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    FileText, 
    LayoutDashboard, 
    LogOut, 
    PenSquare,
    Settings
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"

const MedhaLogo = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 160 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      >
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="32" fontWeight="bold" fill="currentColor" className="font-headline">
            MEDHA
        </text>
    </svg>
);


export function SidebarNav() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { isCollapsed } = useSidebar()

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            {isCollapsed ? (
                 <MedhaLogo className="w-10 h-10 text-primary" />
            ) : (
                 <MedhaLogo className="w-32 h-16 text-primary" />
            )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard")}
              tooltip={{ children: "Dashboard" }}
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/my-tutor")}
              tooltip={{ children: "My Tutor" }}
            >
              <Link href="/my-tutor">
                <PenSquare />
                <span>My Tutor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/essay-feedback")}
              tooltip={{ children: "Essay Feedback" }}
            >
              <Link href="/essay-feedback">
                <FileText />
                <span>Essay Feedback</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/settings")}
              tooltip={{ children: "Settings" }}
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip={{ children: "Logout" }}>
                <LogOut />
                <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}

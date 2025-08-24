
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
      viewBox="0 0 160 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      >
      <g transform="translate(0, -10)">
        <g transform="scale(0.8) translate(38, 0)">
            <path d="M50 15 C 40 30, 40 50, 50 60" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 15 C 60 30, 60 50, 50 60" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M50 60 C 40 70, 40 80, 50 90" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 60 C 60 70, 60 80, 50 90" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M50 90 L 30 70" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 90 L 70 70" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M30 70 C 20 60, 20 40, 40 25" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M70 70 C 80 60, 80 40, 60 25" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M40 25 C 45 35, 45 45, 50 60" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M60 25 C 55 35, 55 45, 50 60" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g transform="scale(0.8) translate(3,10)">
            <path d="M25 25 L 45 35" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="20" y="15" width="20" height="10" stroke="currentColor" strokeWidth="3" fill="currentColor" />
            <line x1="45" y1="20" x2="45" y2="25" stroke="currentColor" strokeWidth="3" />
        </g>
        
        <g transform="scale(0.8) translate(80, 0)">
            <path d="M50 25 C 60 15, 70 15, 70 25" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M70 25 C 65 30, 60 35, 55 40" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M70 25 C 75 30, 80 35, 85 40" stroke="currentColor" strokeWidth="3" fill="none" />
        </g>
        </g>
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
            {isCollapsed ? <MedhaLogo className="w-10 h-10 text-primary" /> : <MedhaLogo className="w-32 h-16 text-primary" />}
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

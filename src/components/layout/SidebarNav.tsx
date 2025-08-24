
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    Book,
    FileText, 
    LayoutDashboard, 
    LogOut, 
    Library, 
    Contact,
    PenSquare,
    Shield,
    History,
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
  SidebarGroup,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarNav() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const { isCollapsed } = useSidebar()

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  const logo = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  );

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            {logo}
            {!isCollapsed && <span className="text-xl font-bold font-headline">Medha</span>}
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
              isActive={isActive("/history")}
              tooltip={{ children: "History" }}
            >
              <Link href="/history">
                <History />
                <span>History</span>
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

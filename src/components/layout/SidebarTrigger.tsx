"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function SidebarTrigger() {
  const { isMobile, onSheetOpenChange } = useSidebar()

  if (!isMobile) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onSheetOpenChange(true)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  )
}

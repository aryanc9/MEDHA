"use client"

import * as React from "react"
import { type VariantProps, cva } from "class-variance-authority"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const sidebarVariants = cva(
  "z-50 flex h-full shrink-0 flex-col gap-4 border-r bg-card duration-300 ease-in-out",
  {
    variants: {
      size: {
        default: "w-72",
        collapsed: "w-16",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface SidebarContextProps extends VariantProps<typeof sidebarVariants> {
  isMobile: boolean
  isCollapsed: boolean
  onCollapse?: () => void
  isSheetOpen: boolean
  onSheetOpenChange: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

function SidebarProvider({
  children,
  ...props
}: { children: React.ReactNode } & Partial<SidebarContextProps>) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = React.useState(
    props.isCollapsed ?? false
  )
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const onCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  return (
    <TooltipProvider>
      <SidebarContext.Provider
        value={{
          ...props,
          isMobile,
          isCollapsed: isMobile ? false : isCollapsed,
          onCollapse,
          isSheetOpen: isMobile ? isSheetOpen : false,
          onSheetOpenChange: setIsSheetOpen,
        }}
      >
        {children}
      </SidebarContext.Provider>
    </TooltipProvider>
  )
}

const CollapseButton = () => {
    const { isCollapsed, onCollapse, isMobile } = useSidebar();

    if (isMobile) return null;

    return (
        <div className="absolute top-1/2 -right-4 z-10">
            <Button size="icon" variant="outline" className="rounded-full h-8 w-8" onClick={onCollapse}>
                {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </Button>
        </div>
    )
}


function Sidebar({
  className,
  size,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sidebarVariants>) {
  const { isMobile, isCollapsed, isSheetOpen, onSheetOpenChange } = useSidebar()
  const finalSize = isCollapsed ? "collapsed" : size

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
        <SheetContent side="left" className="w-72 p-0 border-r">
          <aside className={cn(sidebarVariants({ size }), className)} {...props}>
            {children}
          </aside>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn("relative", sidebarVariants({ size: finalSize }), className)}
      {...props}
    >
        {children}
        <CollapseButton />
    </aside>
  )
}

function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  return (
    <div
      className={cn(
        "flex h-20 items-center border-b px-6",
        isCollapsed && "h-20 justify-center px-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex grow flex-col overflow-y-auto", className)}
      {...props}
    />
  )
}

function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto flex flex-col border-t", className)}
      {...props}
    />
  )
}

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-1 p-2", className)} {...props} />
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
  }
>(({ className, title, ...props }, ref) => {
  const { isCollapsed } = useSidebar()
  if (isCollapsed && title) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div ref={ref} className={cn("p-2", className)} {...props} />
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    )
  }
  return (
    <div ref={ref} className={cn("p-2", className)} {...props}>
      {title && (
        <p className="mb-2 px-2 text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      {props.children}
    </div>
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative", className)} {...props} />
  )
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarButtonVariants = cva(
  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-md font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground",
  {
    variants: {
      isActive: {
        true: "bg-primary/10 text-primary hover:bg-primary/20",
      },
      isCollapsed: {
        true: "justify-center",
      },
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button> & {
    isActive?: boolean
    tooltip?: {
      children: React.ReactNode
      content?: React.ReactNode
    }
  }
>(({ className, isActive, tooltip, children, ...props }, ref) => {
  const { isCollapsed } = useSidebar()

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            className={cn(
              sidebarButtonVariants({
                isCollapsed,
                isActive: isActive ?? false,
              }),
              "h-10",
              className
            )}
            {...props}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
            {tooltip?.content ?? (React.isValidElement(children) ? (children as React.ReactElement<any>).props.children.find((c: any) => typeof c === 'string') : null)}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(sidebarButtonVariants({ isActive: isActive ?? false }), className)}
      {...props}
    >
        {children}
    </Button>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

function SidebarSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-2 my-2 h-px bg-border", className)}
      {...props}
    />
  )
}

function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grow overflow-auto bg-background", className)}
      {...props}
    />
  )
}

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInset,
  useSidebar,
}

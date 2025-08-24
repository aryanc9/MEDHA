
'use client';

import * as React from 'react';
import Link from 'next/link';
import { UserCircle, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { SidebarTrigger } from '@/components/layout/SidebarTrigger';
import { usePathname } from 'next/navigation';

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
        <text x="50%" y="95%" dominantBaseline="hanging" textAnchor="middle" fontSize="32" fontWeight="bold" fill="currentColor" className="font-headline">
            MEDHA
        </text>
    </svg>
);


export function Header() {
  const { user, signOut } = useAuth();
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/my-tutor') || pathname.startsWith('/essay-feedback') || pathname.startsWith('/settings');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between mx-auto">
        <div className="flex items-center gap-4">
            {isDashboard ? <SidebarTrigger /> : null}
             <Link href="/" className="hidden md:flex items-center gap-2">
                <MedhaLogo className="w-32 h-16 text-primary" />
            </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                   <UserCircle className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

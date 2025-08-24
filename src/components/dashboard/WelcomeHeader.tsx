
"use client"

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";


export function WelcomeHeader() {
    const { user } = useAuth();
    const displayName = user?.displayName || 'Student';
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Welcome Back, {displayName}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    Let&apos;s continue your learning journey and make some progress today.
                </p>
            </div>
            <Button>
                Start Learning
            </Button>
        </div>
    );
}

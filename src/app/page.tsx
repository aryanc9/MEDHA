
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Shape({ className }: { className?: string }) {
  return <div className={className}></div>;
}

export default function HomePage() {
  return (
        <div className="min-h-[calc(100vh-80px)] bg-background text-foreground relative overflow-hidden">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center py-20">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight font-headline">
                Next Level AI Tutoring
                <br />
                <span className="text-primary">For Lifelong Learners</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Create a custom learning pathway to help you achieve more in school, work, and life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button asChild size="lg" className="rounded-full font-semibold shadow-lg transition-transform transform hover:scale-105">
                    <Link href="/dashboard">
                        Start creating custom courses
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </Button>
            </div>
            <div className="mt-16">
                <p className="text-muted-foreground mb-4">Popular topics to start with:</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" className="rounded-full">
                    Fundamentals of Machine Learning
                </Button>
                <Button variant="outline" className="rounded-full">
                    Intermediate French
                </Button>
                <Button variant="outline" className="rounded-full">
                    Mindfulness at work
                </Button>
                </div>
            </div>
            <div className="mt-12">
                <Link href="#">
                <div className="flex items-center gap-3 text-primary font-semibold hover:underline">
                    <PlayCircle className="w-8 h-8" />
                    <span>Medha explained in 165 seconds</span>
                </div>
                </Link>
            </div>
            </div>
        </main>
        
        {/* Decorative Shapes */}
        <Shape className="absolute top-24 -left-20 w-40 h-40 bg-pink-300/20 rounded-full opacity-50 blur-xl" />
        <Shape className="absolute top-1/2 -left-10 w-48 h-48 bg-cyan-300/20 rounded-lg opacity-50 -rotate-12 blur-xl" />
        <Shape className="absolute bottom-10 left-20 w-32 h-32 bg-yellow-300/20 rounded-full opacity-50 rotate-45 blur-xl" />
        <Shape className="absolute top-20 -right-20 w-48 h-48 bg-red-400/20 rounded-full opacity-50 blur-xl" />
        <Shape className="absolute top-1/2 -right-10 w-40 h-40 bg-green-400/20 rounded-2xl opacity-50 rotate-12 blur-xl" />
        <Shape className="absolute bottom-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-lg opacity-50 blur-xl" />
        </div>
  );
}

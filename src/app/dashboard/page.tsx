
'use client';

import { useState, useEffect } from 'react';
import { BookOpenCheck, BrainCircuit, Loader2, TrendingUp, Target, Star } from 'lucide-react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { FeatureCard } from '@/components/dashboard/FeatureCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { analyzeReflection } from '@/ai/flows/analyze-reflection';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { CourseHistory } from '@/components/dashboard/CourseHistory';

const ReflectionCard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [reflectionText, setReflectionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleSubmitReflection = async () => {
        if (!reflectionText.trim() || !user) {
            toast({ title: "Please write your reflection first.", variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        setFeedback('');
        try {
            const { feedback, pointsAwarded } = await analyzeReflection({
                userId: user.uid,
                reflectionText: reflectionText,
            });
            setFeedback(`${feedback} You've been awarded ${pointsAwarded} points.`);
             toast({
                title: `Reflection Submitted! 🎉`,
                description: `You've been awarded ${pointsAwarded} points.`,
            });
            setReflectionText('');
        } catch (error: any) {
            toast({ title: 'Error Submitting Reflection', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span>Learning Insights & Reflections</span>
                </CardTitle>
                <CardDescription>
                    Reflect on what you've learned to solidify your knowledge and earn points. What was challenging? What clicked?
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <Textarea 
                        placeholder="e.g., I finally understood how async/await works in Javascript by comparing it to making a sandwich..." 
                        rows={5}
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSubmitReflection} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Reflection
                        </Button>
                    </div>
                     {feedback && (
                        <div className="p-4 bg-muted/50 border rounded-lg text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground mb-2">AI Feedback:</p>
                            {feedback}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


export default function DashboardPage() {
  const { user, userSettings } = useAuth();
  
  return (
    <div className="flex flex-col w-full p-4 md:p-8 gap-8">
      <WelcomeHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-400" />
                    <span>Student Score</span>
                </CardTitle>
                <CardDescription>
                    Points earned from metacognitive activities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{userSettings?.studentScore || 0}</p>
            </CardContent>
            <CardFooter>
                 <p className="text-sm text-muted-foreground">Keep reflecting to earn more!</p>
            </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    <span>Current Goal: {userSettings?.learningGoal || 'Not set'}</span>
                </CardTitle>
                <CardDescription>
                    Your progress towards completing your primary learning objective.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={33} className="w-full" />
            </CardContent>
            <CardFooter>
                 <p className="text-sm text-muted-foreground">You're off to a great start! Keep going.</p>
            </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <CourseHistory />
        </div>
        <div className="lg:col-span-1">
            <div className="flex flex-col gap-6">
                 <FeatureCard
                    title="Adaptive AI Tutor"
                    description="Generate a personalized course on any topic."
                    href="/my-tutor"
                    icon={<BrainCircuit className="h-10 w-10 text-primary" />}
                    fullHeight
                    />
                <FeatureCard
                    title="Essay Feedback"
                    description="Get instant, detailed feedback on your essays."
                    href="/essay-feedback"
                    icon={<BookOpenCheck className="h-10 w-10 text-primary" />}
                    fullHeight
                />
            </div>
        </div>
      </div>
       <div className="grid grid-cols-1">
            <ReflectionCard />
      </div>
    </div>
  );
}

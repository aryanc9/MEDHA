
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { analyzeReflection } from '@/ai/flows/analyze-reflection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReflectionCardProps {
    prompt?: string;
    courseId?: string;
    className?: string;
    isTutorCard?: boolean;
}

export const ReflectionCard = ({ prompt, courseId, className, isTutorCard = false }: ReflectionCardProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [reflectionText, setReflectionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [points, setPoints] = useState(0);

    const handleSubmitReflection = async () => {
        if (!reflectionText.trim() || !user) {
            toast({ title: "Please write your reflection first.", variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        setFeedback('');
        setPoints(0);
        try {
            const result = await analyzeReflection({
                userId: user.uid,
                reflectionText: reflectionText,
            });
            setFeedback(result.feedback);
            setPoints(result.pointsAwarded);
            toast({
                title: `Reflection Submitted! 🎉`,
                description: `${result.feedback} You've been awarded ${result.pointsAwarded} points.`,
            });
            // Do not clear reflection text so user can see what they wrote
        } catch (error: any) {
            toast({ title: 'Error Submitting Reflection', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const cardTitle = isTutorCard ? "Reflection Prompt" : "Learning Insights & Reflections";
    const cardDescription = isTutorCard 
        ? "Reflect on this course to solidify your knowledge."
        : "Reflect on what you've learned to solidify your knowledge and earn points. What was challenging? What clicked?";


    return (
        <Card className={cn(className)}>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                   <Lightbulb className="h-6 w-6 text-primary" />
                   <span>{cardTitle}</span>
                </CardTitle>
                <CardDescription>
                    {isTutorCard && prompt ? `"${prompt}"` : cardDescription}
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
                        <Button onClick={handleSubmitReflection} disabled={isSubmitting || !!feedback}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Reflection
                        </Button>
                    </div>
                     {feedback && (
                        <div className="p-4 bg-muted/50 border rounded-lg text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground mb-2">AI Feedback:</p>
                            <p className="italic mb-2">&quot;{feedback}&quot;</p>
                            <p className="font-bold text-primary text-right">Points Awarded: {points}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


'use client';

import { useEffect, useState } from 'react';
import { BookOpenCheck, BrainCircuit, Route, Loader2, MessageSquare, ArrowRight, TrendingUp, Lightbulb, Target, Star } from 'lucide-react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { FeatureCard } from '@/components/dashboard/FeatureCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getPersonalizedLearningPath, PersonalizedLearningPathOutput } from '@/ai/flows/personalized-learning-paths';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const { user, userSettings } = useAuth();
  const [learningPath, setLearningPath] = useState<PersonalizedLearningPathOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLearningPath() {
      if (!user || !userSettings) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const path = await getPersonalizedLearningPath({
          studentId: user.uid,
          performanceData: userSettings.performanceData || {},
          careerPath: userSettings.careerPath || 'Software Engineer',
          academicLevel: userSettings.academicLevel || 'Undergraduate',
        });
        setLearningPath(path);
      } catch (error) {
        console.error("Failed to fetch learning path:", error);
        setLearningPath({
          reasoning: "Could not load your personalized learning path. Please try again later.",
          moduleRecommendations: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLearningPath();
  }, [user, userSettings]);


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

       <div className="grid grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span>Learning Insights & Reflections</span>
                </CardTitle>
                <CardDescription>
                      Review your performance, analyze mistakes, and get prompts to reflect on your learning strategies.
                  </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <Lightbulb className="h-10 w-10 mx-auto mb-4" />
                    <p>Your learning insights will appear here after you complete a few lessons.</p>
                    <p className="text-sm">This is where the AI will help you analyze your learning patterns.</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Route className="h-6 w-6 text-primary" />
                    <span>Your Recommended Path</span>
                </CardTitle>
                {loading ? (
                  <CardDescription>Loading your personalized recommendations...</CardDescription>
                ) : (
                  <CardDescription>
                      {learningPath?.reasoning || "Set your learning goal in settings to see your personalized path."}
                  </CardDescription>
                )}
            </Header>
            <CardContent>
                {loading ? (
                   <div className="flex items-center justify-center h-40">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   </div>
                ) : (
                  <ul className="space-y-3">
                      {learningPath?.moduleRecommendations && learningPath.moduleRecommendations.length > 0 ? learningPath.moduleRecommendations.map((module, index) => (
                          <li key={index}>
                            <Button asChild variant="ghost" className="w-full justify-start h-auto p-3 bg-muted/50 rounded-md group">
                                <Link href={`/my-tutor?topic=${encodeURIComponent(module)}`}>
                                  <span className="font-medium text-muted-foreground mr-3">{index + 1}.</span>
                                  <span className="font-medium flex-1 text-left">{module}</span>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"/>
                                </Link>
                            </Button>
                          </li>
                      )) : <p className="text-muted-foreground">No learning path recommendations available yet.</p>}
                  </ul>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

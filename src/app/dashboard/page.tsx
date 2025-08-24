
'use client';

import { useEffect, useState } from 'react';
import { BookOpenCheck, BrainCircuit, Route, Loader2, MessageSquare } from 'lucide-react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { FeatureCard } from '@/components/dashboard/FeatureCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getPersonalizedLearningPath, PersonalizedLearningPathOutput } from '@/ai/flows/personalized-learning-paths';

export default function DashboardPage() {
  const { user, userSettings } = useAuth();
  const [learningPath, setLearningPath] = useState<PersonalizedLearningPathOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLearningPath() {
      if (user && userSettings) {
        setLoading(true);
        try {
          const path = await getPersonalizedLearningPath({
            studentId: user.uid,
            performanceData: {}, // In a real app, this would come from user's progress
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
      } else if (!userSettings) {
         // If there are no settings, don't keep it in a loading state
        setLoading(false);
      }
    }

    if (user) {
        fetchLearningPath();
    } else {
        // If there's no user, stop loading.
        setLoading(false);
    }
  }, [user, userSettings]);


  return (
    <div className="flex flex-col w-full p-4 md:p-8 gap-8">
      <WelcomeHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          title="My Tutor"
          description="Your personal AI-powered tutor. Ask any question and get instant explanations."
          href="/my-tutor"
          icon={<BrainCircuit className="h-8 w-8 text-primary" />}
        />
        <FeatureCard
          title="Essay Feedback"
          description="Submit your essays for instant, AI-powered feedback."
          href="/essay-feedback"
          icon={<BookOpenCheck className="h-8 w-8 text-primary" />}
        />
         <FeatureCard
          title="Talk Buddy"
          description="Practice languages with your real-time conversational AI partner."
          href="/my-tutor?tab=buddy"
          icon={<MessageSquare className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Route className="h-6 w-6 text-primary" />
                    <span>Your Learning Path</span>
                </CardTitle>
                {loading ? (
                  <CardDescription>Loading your personalized recommendations...</CardDescription>
                ) : (
                  <CardDescription>
                      {learningPath?.reasoning || "Set your career path in settings to see your personalized learning path."}
                  </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                   <div className="flex items-center justify-center h-40">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   </div>
                ) : (
                  <ul className="space-y-3">
                      {learningPath?.moduleRecommendations && learningPath.moduleRecommendations.length > 0 ? learningPath.moduleRecommendations.map((module, index) => (
                          <li key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                          <span className="font-medium text-muted-foreground">{index + 1}.</span>
                          <span className="font-medium">{module}</span>
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

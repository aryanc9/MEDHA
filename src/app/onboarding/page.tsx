
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { ProtectRoute } from '@/components/auth/ProtectRoute';
import { Input } from '@/components/ui/input';


const formSchema = z.object({
  learningGoal: z.string().min(5, 'Please briefly describe your learning goal.'),
  careerPath: z.string().min(1, 'Please select a career path.'),
  academicLevel: z.string().min(1, 'Please select an academic level.'),
});

type FormData = z.infer<typeof formSchema>;

function OnboardingPageContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, userSettings, updateUserSettings } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      learningGoal: '',
      careerPath: '',
      academicLevel: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
      await updateUserSettings(user.uid, { 
        ...userSettings,
        learningGoal: data.learningGoal,
        careerPath: data.careerPath,
        academicLevel: data.academicLevel,
        email: user.email, // ensure these are always present
        displayName: user.displayName,
      });

      toast({
        title: "Welcome!",
        description: "Your personalized learning journey has been set up.",
      });

      router.push('/dashboard');

    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-full max-w-lg p-4">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold font-headline">Welcome to Medha!</CardTitle>
                    <CardDescription>To get started, let's set your first learning goal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                        <FormField
                            control={form.control}
                            name="learningGoal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>What is your primary learning goal right now?</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 'Master calculus for my final exam'" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="careerPath"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>What is your desired career path?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a career" />
                                    </Trigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                                    <SelectItem value="UX/UI Designer">UX/UI Designer</SelectItem>
                                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                                    <SelectItem value="Doctor">Doctor</SelectItem>
                                    <SelectItem value="Lawyer">Lawyer</SelectItem>
                                    <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                                    <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                                    <SelectItem value="Not Decided Yet">Not Decided Yet</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="academicLevel"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>What is your current academic level?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select your level" />
                                    </Trigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Middle School">Middle School (Grades 6-8)</SelectItem>
                                    <SelectItem value="High School">High School (Grades 9-12)</SelectItem>
                                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                    <SelectItem value="Graduate">Graduate</SelectItem>
                                    <SelectItem value="Professional">Professional</SelectItem>
                                    <SelectItem value="Lifelong Learner">Lifelong Learner</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full" size="lg">
                        {loading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Setting Up Your Dashboard...
                            </>
                        ) : (
                            'Complete Setup'
                        )}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


export default function OnboardingPage() {
    return (
        <ProtectRoute>
            <OnboardingPageContent />
        </ProtectRoute>
    )
}

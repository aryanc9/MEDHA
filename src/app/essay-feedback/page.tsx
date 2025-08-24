
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { essayFeedback, EssayFeedbackOutput } from '@/ai/flows/essay-feedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  topic: z.string().min(1, 'Please enter the essay topic.'),
  gradeLevel: z.string().min(1, 'Please select your grade level.'),
  essay: z.string().min(50, 'Essay must be at least 50 characters long.'),
});

type FormData = z.infer<typeof formSchema>;

export default function EssayFeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayFeedbackOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '',
      essay: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await essayFeedback(data);
      setResult(response);
      toast({ title: "Success!", description: `Your feedback has been generated.`});
    } catch (error) {
      console.error('Failed to get essay feedback:', error);
      toast({ title: "Error", description: "Failed to get essay feedback. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Essay Feedback</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Get instant, constructive feedback on your writing. Our AI analyzes grammar, coherence, relevance, and creativity.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Essay</CardTitle>
              <CardDescription>Paste your essay below and provide some context.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Essay Topic</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., The American Revolution" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Middle School">Middle School</SelectItem>
                              <SelectItem value="High School">High School</SelectItem>
                              <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                              <SelectItem value="Graduate">Graduate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="essay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Essay</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Paste your essay here..." rows={15} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Get Feedback
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 lg:mt-0">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
              <CardDescription>Here is the breakdown of your essay analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <p>Our AI is reading your essay...</p>
                </div>
              )}
              {!loading && !result && (
                <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                  <p>Your feedback will appear here once you submit your essay.</p>
                </div>
              )}
              {result && (
                <Accordion type="single" collapsible defaultValue="item-4" className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Grammar</AccordionTrigger>
                    <AccordionContent>{result.grammarFeedback}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Coherence</AccordionTrigger>
                    <AccordionContent>{result.coherenceFeedback}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Relevance to Topic</AccordionTrigger>
                    <AccordionContent>{result.relevanceFeedback}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Creativity</AccordionTrigger>
                    <AccordionContent>{result.creativityFeedback}</AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-4">
                    <AccordionTrigger className="text-base font-bold text-primary">Overall Feedback</AccordionTrigger>
                    <AccordionContent>{result.overallFeedback}</AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

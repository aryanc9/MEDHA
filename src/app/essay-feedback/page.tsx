
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { essayFeedback, type EssayFeedbackOutput } from '@/ai/flows/essay-feedback';
import { essayFeedbackChat, type EssayFeedbackChatInput } from '@/ai/flows/essay-feedback-chat';
import type { ChatMessage } from '@/ai/schemas/essay-feedback-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, Send, User, Bot } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';


const formSchema = z.object({
  topic: z.string().min(1, 'Please enter the essay topic.'),
  gradeLevel: z.string().min(1, 'Please select your grade level.'),
  essay: z.string().min(50, 'Essay must be at least 50 characters long.'),
});

type FormData = z.infer<typeof formSchema>;

const HighlightedEssayDisplay = ({ content }: { content: string }) => {
    const parsedContent = content
        .replace(/~~\s*(.*?)\s*~~/g, '<del class="bg-red-500/20 px-1 rounded-sm">$1</del>')
        .replace(/\*\*\s*(.*?)\s*\*\*/g, '<strong class="bg-green-500/20 px-1 rounded-sm">$1</strong>');

    return (
        <div 
            className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
        />
    );
};

export default function EssayFeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayFeedbackOutput | null>(null);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: '', gradeLevel: '', essay: '' },
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatQuery, setChatQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setResult(null);
    setChatHistory([]);
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

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatQuery.trim() || !result) return;
      
      const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: chatQuery }];
      setChatHistory(newHistory);
      setChatQuery('');
      setIsChatLoading(true);

      try {
          const chatInput: EssayFeedbackChatInput = {
              ...form.getValues(),
              initialFeedback: result,
              chatHistory: newHistory.map(m => ({sender: m.sender, text: m.text})),
              query: chatQuery,
          };
          const response = await essayFeedbackChat(chatInput);

          setChatHistory(prev => [...prev, { sender: 'bot', text: response.response }]);
          
          if(response.updatedEssay) {
            setResult(prev => prev ? { ...prev, highlightedEssay: response.updatedEssay! } : null);
            toast({ title: "Essay Updated", description: "The suggested revisions have been updated based on your request."})
          }

      } catch (error) {
          console.error("Chat Error:", error);
          toast({ title: "Chat Error", description: "Failed to get a response.", variant: "destructive"})
          setChatHistory(prev => prev.slice(0, -1));
      } finally {
          setIsChatLoading(false);
      }
  }

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Essay Feedback</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Get instant, constructive feedback on your writing. Our AI analyzes grammar, coherence, relevance, and creativity.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
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
              <CardDescription>Here is the breakdown of your essay analysis and suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <p>Our AI is reading your essay...</p>
                </div>
              )}
              {!loading && !result && (
                <div className="flex items-center justify-center h-96 text-center text-muted-foreground">
                  <p>Your feedback will appear here once you submit your essay.</p>
                </div>
              )}
              {result && (
                <div className="flex flex-col h-[80vh]">
                    <div className="flex-1 overflow-y-auto pr-4">
                        <div className="space-y-6">
                            <Accordion type="single" collapsible defaultValue="item-4" className="w-full">
                                <AccordionItem value="item-1"><AccordionTrigger>Grammar</AccordionTrigger><AccordionContent>{result.grammarFeedback}</AccordionContent></AccordionItem>
                                <AccordionItem value="item-2"><AccordionTrigger>Coherence</AccordionTrigger><AccordionContent>{result.coherenceFeedback}</AccordionContent></AccordionItem>
                                <AccordionItem value="item-3"><AccordionTrigger>Relevance to Topic</AccordionTrigger><AccordionContent>{result.relevanceFeedback}</AccordionContent></AccordionItem>
                                <AccordionItem value="item-5"><AccordionTrigger>Creativity</AccordionTrigger><AccordionContent>{result.creativityFeedback}</AccordionContent></AccordionItem>
                                <AccordionItem value="item-4"><AccordionTrigger className="text-base font-bold text-primary">Overall Feedback</AccordionTrigger><AccordionContent>{result.overallFeedback}</AccordionContent></AccordionItem>
                            </Accordion>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Wand2 className="h-5 w-5 text-primary"/>Suggested Revisions</h3>
                                <p className="text-sm text-muted-foreground mb-4">Text to be <strong className="text-green-600">added is bold</strong> and text to be <del className="text-red-600">removed is struck through</del>.</p>
                                <div className="border rounded-md p-4 max-h-80 overflow-y-auto">
                                    <HighlightedEssayDisplay content={result.highlightedEssay} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-lg font-semibold">Interact with Feedback</h3>
                         <ScrollArea className="h-48 w-full pr-4">
                            <div className="space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                        {msg.sender === 'bot' && <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><Bot className="h-5 w-5"/></div>}
                                        <div className={`rounded-lg px-4 py-2 max-w-sm text-sm ${msg.sender === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                            <p>{msg.text}</p>
                                        </div>
                                        {msg.sender === 'user' && <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><User className="h-5 w-5"/></div>}
                                    </div>
                                ))}
                                 {isChatLoading && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><Bot className="h-5 w-5"/></div>
                                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center"><Loader2 className="h-5 w-5 animate-spin"/></div>
                                    </div>
                                )}
                            </div>
                         </ScrollArea>
                        <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                            <Input 
                                value={chatQuery}
                                onChange={e => setChatQuery(e.target.value)}
                                placeholder="e.g., 'Can you make it sound more formal?'"
                                disabled={isChatLoading}
                            />
                            <Button type="submit" disabled={isChatLoading || !chatQuery}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

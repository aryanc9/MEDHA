
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    BookCopy, 
    Upload, 
    Search,
    Loader2,
    Youtube,
    Newspaper,
    Info,
    FileUp,
    Sparkles,
    BrainCircuit,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    BookText,
    Video,
    Image as ImageIcon,
    MessageSquare,
    Mic,
    Send,
    Volume2,
    User as UserIcon,
    Bot
} from 'lucide-react';
import { myTutor, MyTutorOutput } from '@/ai/flows/my-tutor';
import { talkBuddy, TalkBuddyOutput } from '@/ai/flows/talk-buddy';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Add SpeechRecognition types for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'video':
            return <Youtube className="h-5 w-5 text-red-500" />;
        case 'article':
            return <Newspaper className="h-5 w-5 text-blue-500" />;
        default:
            return <Info className="h-5 w-5 text-gray-500" />;
    }
};

const LessonContentDisplay = ({ content }: { content: string }) => {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
            {content.split('\n').map((line, index) => {
                 if (line.startsWith('- ')) {
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <ChevronRight className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                            <span>{line.substring(2)}</span>
                        </div>
                    );
                }
                if (line.startsWith('##')) {
                    return <h2 key={index} className="text-xl font-bold mt-6 mb-2">{line.replace(/##/g, '').trim()}</h2>
                }
                 if (line.startsWith('#')) {
                    return <h1 key={index} className="text-2xl font-bold mt-8 mb-4">{line.replace(/#/g, '').trim()}</h1>
                }
                if(line.trim() === '') {
                    return <br key={index} />;
                }
                return <p key={index}>{line}</p>;
            })}
        </div>
    )
}

const CourseDisplay = ({ result }: { result: MyTutorOutput; }) => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    if (!result.course) {
        return <p className="text-muted-foreground text-center py-8">No course content was generated.</p>;
    }
    
    const { title, overview, modules } = result.course;
    const videoResources = result.relatedResources?.filter(r => r.type === 'video' && r.videoId) || [];
    const otherResources = result.relatedResources?.filter(r => r.type !== 'video') || [];

    return (
        <Card className="mt-10">
            <CardHeader>
                <CardTitle className="text-3xl font-headline">{title}</CardTitle>
                <CardDescription className="pt-2">{overview}</CardDescription>
                {result.explanation && (
                    <div className="pt-4 space-y-2">
                        <p className="text-base text-muted-foreground">{result.explanation}</p>
                        {result.audioUrl && (
                            <audio controls src={result.audioUrl} className="w-full h-10">
                                Your browser does not support the audio element.
                            </audio>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="course">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="course"><BookText className="mr-2"/> Course Content</TabsTrigger>
                        <TabsTrigger value="resources" disabled={!result.relatedResources || result.relatedResources.length === 0}><Video className="mr-2"/>Further Learning</TabsTrigger>
                        <TabsTrigger value="visual" disabled={!result.imageUrl}><ImageIcon className="mr-2"/>Visual Aid</TabsTrigger>
                    </TabsList>
                    <TabsContent value="course" className="rounded-lg border bg-muted/30 p-2 sm:p-4">
                        <Accordion type="multiple" defaultValue={modules.length > 0 ? ['module-0'] : []} className="w-full">
                            {modules.map((module, moduleIndex) => (
                                <AccordionItem value={`module-${moduleIndex}`} key={moduleIndex}>
                                    <AccordionTrigger className="text-lg sm:text-xl font-bold hover:no-underline p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm flex-shrink-0">{moduleIndex + 1}</div>
                                            {module.title}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-1">
                                        <Accordion type="single" collapsible className="w-full">
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                <AccordionItem value={`lesson-${moduleIndex}-${lessonIndex}`} key={lessonIndex} className="border-b-0">
                                                    <AccordionTrigger className="font-semibold hover:no-underline bg-background rounded-md px-4 my-1">
                                                        Lesson {lessonIndex + 1}: {lesson.title}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-6">
                                                        <LessonContentDisplay content={lesson.content} />
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </TabsContent>
                    <TabsContent value="resources">
                        <div className="space-y-6">
                            {videoResources.length > 0 && (
                                <div className="space-y-4">
                                     <Label>Recommended Videos</Label>
                                    <Select onValueChange={setSelectedVideoId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a video to watch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {videoResources.map((res, i) => (
                                                <SelectItem key={i} value={res.videoId!}>{res.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedVideoId && (
                                        <div className="aspect-video overflow-hidden rounded-lg border mt-4">
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                src={`https://www.youtube.com/embed/${selectedVideoId}`}
                                                title="YouTube video player" 
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    )}
                                </div>
                            )}

                             {otherResources.length > 0 && (
                                <div className="space-y-4 pt-4">
                                    <Label>Articles & Other Resources</Label>
                                    {otherResources.map((resource, index) => (
                                         <a 
                                            key={index}
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block p-4 border rounded-md hover:bg-muted/50 transition-colors group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <ResourceIcon type={resource.type} />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-primary group-hover:underline">{resource.title}</p>
                                                    <p className="text-xs text-muted-foreground break-all">{resource.url}</p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                             )}
                        </div>
                    </TabsContent>
                    <TabsContent value="visual">
                         <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                {result.imageUrl && <Image src={result.imageUrl} alt="Generated image for the course" layout="fill" objectFit="cover" />}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-between items-center pt-6 mt-6 border-t">
                    <Button variant="outline"><ChevronLeft/> Previous Lesson</Button>
                    <Button>Mark as Complete</Button>
                    <Button variant="outline">Next Lesson <ChevronRight/></Button>
                </div>
            </CardContent>
        </Card>
    )
}

const TalkBuddyDisplay = () => {
    const [language, setLanguage] = useState('English');
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string; audioUrl?: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US'; // This can be changed dynamically

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                handleSendMessage(transcript); 
            };
            recognitionRef.current.onerror = (event: any) => {
                toast({ title: "Speech Recognition Error", description: event.error, variant: "destructive" });
                setIsListening(false);
            };
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [toast]);
    
     useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        const currentMessage = text.trim();
        if (!currentMessage) return;

        setMessages(prev => [...prev, { sender: 'user', text: currentMessage }]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await talkBuddy({ prompt: currentMessage, language });
            setMessages(prev => [...prev, { sender: 'bot', text: response.responseText, audioUrl: response.audioUrl }]);
            if (response.audioUrl && audioRef.current) {
                audioRef.current.src = response.audioUrl;
                audioRef.current.play().catch(e => console.error("Audio playback failed", e));
            }
        } catch (error) {
            console.error("Talk Buddy failed:", error);
            toast({ title: "Error", description: "Talk Buddy failed to respond.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleListen = () => {
        if (isListening || !recognitionRef.current) return;
        setIsListening(true);
        recognitionRef.current.start();
    }
    
    return (
        <Card className="mt-10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot /> Talk Buddy</CardTitle>
                <CardDescription>Have a real-time conversation with your AI tutor in any language.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-[600px] border rounded-lg">
                    <div className="p-4 border-b">
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Japanese">Japanese</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                    {msg.sender === 'bot' && <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><Bot className="h-5 w-5"/></div>}
                                    <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                    {msg.sender === 'user' && <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><UserIcon className="h-5 w-5"/></div>}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><Bot className="h-5 w-5"/></div>
                                    <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin"/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-background">
                        <div className="flex items-center gap-2">
                             <Input 
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
                                placeholder="Ask your buddy anything..."
                                disabled={isLoading}
                             />
                             <Button onClick={() => handleSendMessage(userInput)} disabled={isLoading || !userInput}>
                                <Send className="h-5 w-5"/>
                             </Button>
                             <Button variant="outline" onClick={handleListen} disabled={isListening || isLoading}>
                                {isListening ? <Volume2 className="h-5 w-5 animate-pulse text-red-500"/> : <Mic className="h-5 w-5"/>}
                             </Button>
                        </div>
                    </div>
                </div>
                 <audio ref={audioRef} style={{ display: 'none' }} />
            </CardContent>
        </Card>
    );
}


export default function MyTutorPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [topic, setTopic] = useState('');
  const [isResearchMode, setIsResearchMode] = useState(false);
  const [useOwnSources, setUseOwnSources] = useState(false);
  const [defineStructure, setDefineStructure] = useState(false);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [courseStructure, setCourseStructure] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MyTutorOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string;
         setSourceFile(textContent);
         setFileName(file.name);
      };
      reader.onerror = () => {
        toast({ title: "Error reading file", description: "Could not read the selected file.", variant: "destructive" });
      }
      reader.readAsText(file);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast({ title: "Topic is required", description: "Please enter a topic to generate a course.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await myTutor({
        prompt: topic,
        researchMode: isResearchMode,
        sourceFile: useOwnSources ? sourceFile ?? undefined : undefined,
        courseStructure: defineStructure ? courseStructure : undefined,
      });
      setResult(response);
    } catch (error) {
      console.error('Failed to create course:', error);
      toast({ title: "Error", description: "Failed to create the course. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const suggestedTopics = ["Quantum Computing Basics", "The History of Ancient Rome", "Introduction to Javascript", "How to bake Sourdough Bread"];

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline">My AI Tutor</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Generate a personalized course or chat with your AI buddy.
        </p>
      </div>
      
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create"><BookCopy className="mr-2"/> Create Course</TabsTrigger>
          <TabsTrigger value="buddy"><MessageSquare className="mr-2"/> Talk Buddy</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
             <form onSubmit={handleCreateCourse} className="space-y-8 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> 1. Define Your Topic</CardTitle>
                    <CardDescription>What would you like to learn about today?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'The fundamentals of machine learning'"
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {suggestedTopics.map(t => (
                            <Button key={t} type="button" variant="outline" size="sm" onClick={() => setTopic(t)}>{t}</Button>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> 2. Customize Your Learning</CardTitle>
                        <CardDescription>Refine how the AI generates your course content.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-start space-x-4 rounded-lg border p-4">
                            <Search className="h-6 w-6 mt-1 text-primary"/>
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="research-mode" className="font-semibold">Research Mode</Label>
                                <p className="text-xs text-muted-foreground">Perform a deeper, more thorough search for content.</p>
                            </div>
                            <Switch id="research-mode" checked={isResearchMode} onCheckedChange={setIsResearchMode} />
                        </div>
                        <div className="flex items-start space-x-4 rounded-lg border p-4">
                            <Upload className="h-6 w-6 mt-1 text-primary"/>
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="own-sources" className="font-semibold">Use Own Sources</Label>
                                <p className="text-xs text-muted-foreground">Upload a document to use as the primary source.</p>
                            </div>
                             <Switch id="own-sources" checked={useOwnSources} onCheckedChange={setUseOwnSources} />
                        </div>
                         <div className="flex items-start space-x-4 rounded-lg border p-4">
                            <ClipboardList className="h-6 w-6 mt-1 text-primary"/>
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="define-structure" className="font-semibold">Define Structure</Label>
                                <p className="text-xs text-muted-foreground">Provide a custom plan or outline for the course.</p>
                            </div>
                             <Switch id="define-structure" checked={defineStructure} onCheckedChange={setDefineStructure} />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    {useOwnSources && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Your Source</CardTitle>
                                <CardDescription>Upload a text file (.txt, .md) to use as the knowledge base.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                    <FileUp className="h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="font-semibold mb-2">{fileName || 'Drop your file here'}</p>
                                    <Button asChild variant="outline" size="sm">
                                        <label>
                                            Select File
                                            <Input type="file" accept=".txt,.md" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {defineStructure && (
                         <Card className={!useOwnSources ? "md:col-span-2" : ""}>
                            <CardHeader>
                                <CardTitle>Define Course Structure</CardTitle>
                                <CardDescription>Provide an outline or plan for the AI to follow.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    value={courseStructure}
                                    onChange={(e) => setCourseStructure(e.target.value)}
                                    placeholder="e.g.,&#10;Module 1: Introduction&#10; - Lesson 1.1: What is it?&#10; - Lesson 1.2: Key concepts&#10;Module 2: Advanced Topics..."
                                    rows={8}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>


                <div className="text-center">
                  <Button type="submit" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Your Course...
                      </>
                    ) : (
                      <>
                        <BookCopy className="mr-2 h-5 w-5" />
                        Create My Course
                      </>
                    )}
                  </Button>
                </div>

                {loading && (
                     <Card className="mt-6">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Our AI is crafting your personalized course...</p>
                            <p className="text-sm text-muted-foreground">This may take a moment.</p>
                        </CardContent>
                    </Card>
                )}

                {result && <CourseDisplay result={result} />}
              </form>
        </TabsContent>
        <TabsContent value="buddy">
            <TalkBuddyDisplay />
        </TabsContent>
       </Tabs>
    </div>
  );
}

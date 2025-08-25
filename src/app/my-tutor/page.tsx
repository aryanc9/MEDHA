
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    ChevronRight,
    BookText,
    Video,
    MessageSquare,
    Mic,
    Send,
    Volume2,
    User as UserIcon,
    Bot,
    Accessibility,
    Lightbulb,
    HelpCircle,
    CheckCircle2,
    XCircle,
    Star
} from 'lucide-react';
import { myTutor, type MyTutorOutput } from '@/ai/flows/my-tutor';
import { analyzeReflection } from '@/ai/flows/analyze-reflection';
import { talkBuddy, type TalkBuddyOutput } from '@/ai/flows/talk-buddy';
import type { TalkBuddyMessage } from '@/ai/schemas/talk-buddy-schemas';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'next/navigation';
import { generateQuiz, type GenerateQuizOutput, gradeQuiz, type GradeQuizOutput } from '@/ai/flows/quiz-flow';
import type { QuizQuestion } from '@/ai/schemas/quiz-schemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

const db = getFirestore(firebaseApp);

// Reusable Icon component for different resource types
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

// Component to render lesson content with basic markdown
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

const ReflectionCard = ({ prompt, courseId }: { prompt: string; courseId: string; }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [reflectionText, setReflectionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitReflection = async () => {
        if (!reflectionText.trim() || !user) {
            toast({ title: "Please write your reflection first.", variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const { feedback, pointsAwarded } = await analyzeReflection({
                userId: user.uid,
                reflectionText: reflectionText,
            });
            toast({
                title: `Reflection Submitted! 🎉`,
                description: `${feedback} You've been awarded ${pointsAwarded} points.`,
            });
            setReflectionText('');
        } catch (error: any) {
            toast({ title: 'Error Submitting Reflection', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-blue-900/10 border-blue-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300"><Lightbulb /> Reflection Prompt</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg text-blue-200/90 mb-4">{prompt}</p>
                <Textarea 
                    placeholder="Write your thoughts here..." 
                    rows={5} 
                    className="bg-background/50"
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    disabled={isSubmitting}
                />
                <Button className="mt-4" onClick={handleSubmitReflection} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Reflection
                </Button>
            </CardContent>
        </Card>
    );
};

const QuizDisplay = ({ courseContent }: { courseContent: string }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
    const [isGrading, setIsGrading] = useState(false);
    const [gradeResult, setGradeResult] = useState<GradeQuizOutput | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            setIsLoading(true);
            try {
                const { questions } = await generateQuiz({ courseContent });
                setQuiz(questions);
            } catch (error: any) {
                toast({ title: "Failed to generate quiz", description: error.message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [courseContent, toast]);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmitQuiz = async () => {
        if (!quiz || !user) return;
        if (Object.keys(userAnswers).length !== quiz.length) {
            toast({ title: "Please answer all questions before submitting.", variant: "destructive" });
            return;
        }

        setIsGrading(true);
        setGradeResult(null);
        try {
            const formattedAnswers = quiz.map((q, i) => ({
                question: q.question,
                selectedAnswer: userAnswers[i],
            }));
            const result = await gradeQuiz({ userId: user.uid, questions: quiz, userAnswers: formattedAnswers });
            setGradeResult(result);
             toast({ title: "Quiz Graded!", description: `You scored ${result.score}% and earned ${result.pointsAwarded} points!` });
        } catch (error: any) {
            toast({ title: "Failed to grade quiz", description: error.message, variant: "destructive" });
        } finally {
            setIsGrading(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating your quiz...</p>
            </div>
        )
    }

    if (!quiz) {
         return <p className="text-muted-foreground text-center p-8 border rounded-lg">Could not load the quiz. Please try again later.</p>;
    }
    
     if (gradeResult) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Results</CardTitle>
                        <CardDescription>You scored {gradeResult.score}% and earned {gradeResult.pointsAwarded} points!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {gradeResult.feedback.map((item, index) => (
                            <div key={index} className={cn("p-4 mb-4 rounded-lg border", item.isCorrect ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10")}>
                                <p className="font-bold flex items-center gap-2">
                                     {item.isCorrect ? <CheckCircle2 className="text-green-500"/> : <XCircle className="text-red-500"/>}
                                    {item.question}
                                </p>
                                <p className="text-sm mt-2">Your answer: <span className={cn(!item.isCorrect && "line-through")}>{item.userAnswer}</span></p>
                                {!item.isCorrect && <p className="text-sm">Correct answer: {item.correctAnswer}</p>}
                                <p className="text-sm mt-2 text-muted-foreground italic">{item.explanation}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }


    return (
        <div className="space-y-8">
            {quiz.map((q, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle className="flex items-start gap-3">
                           <HelpCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" /> 
                           <span>{q.question}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup onValueChange={(value) => handleAnswerChange(index, value)}>
                            {q.options.map((option, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                                    <Label htmlFor={`q${index}-o${i}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}
            <Button onClick={handleSubmitQuiz} disabled={isGrading} size="lg">
                {isGrading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Grading...</> : 'Submit Quiz'}
            </Button>
        </div>
    )
};


// Component to display the generated course
const CourseDisplay = ({ result }: { result: MyTutorOutput; }) => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    if (!result.course) {
        return <p className="text-muted-foreground text-center py-8">No course content was generated.</p>;
    }
    
    const { title, overview, modules } = result.course;
    const videoResources = result.relatedResources?.filter(r => r.type === 'video' && r.videoId) || [];
    const otherResources = result.relatedResources?.filter(r => r.type !== 'video') || [];

    const getFullCourseContent = () => {
        if (!result.course) return '';
        let content = `${result.course.title}\n${result.course.overview}\n\n`;
        result.course.modules.forEach(module => {
            content += `Module: ${module.title}\n`;
            module.lessons.forEach(lesson => {
                content += `Lesson: ${lesson.title}\n${lesson.content}\n\n`;
            });
        });
        return content;
    };


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
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="course"><BookText className="mr-2"/> Course Content</TabsTrigger>
                        <TabsTrigger value="quiz"><HelpCircle className="mr-2"/>Take Quiz</TabsTrigger>
                        <TabsTrigger value="reflection" disabled={!result.reflectionPrompt}><Lightbulb className="mr-2"/>Reflection</TabsTrigger>
                        <TabsTrigger value="resources" disabled={!result.relatedResources || result.relatedResources.length === 0}><Video className="mr-2"/>Further Learning</TabsTrigger>
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
                    <TabsContent value="quiz">
                        <QuizDisplay courseContent={getFullCourseContent()} />
                    </TabsContent>
                    <TabsContent value="reflection">
                        {result.reflectionPrompt && result.id && (
                            <ReflectionCard prompt={result.reflectionPrompt} courseId={result.id} />
                        )}
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
                </Tabs>
            </CardContent>
        </Card>
    )
}

// Component for the course creation form
const CourseCreationForm = ({
    initialTopic = '',
    onCourseCreate,
}:{
    initialTopic?: string;
    onCourseCreate: (output: MyTutorOutput | null) => void;
}) => {
    const { user } = useAuth();
    const [topic, setTopic] = useState(initialTopic);
    const [isResearchMode, setIsResearchMode] = useState(false);
    const [useOwnSources, setUseOwnSources] = useState(false);
    const [defineStructure, setDefineStructure] = useState(false);
    const [sourceFile, setSourceFile] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [courseStructure, setCourseStructure] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
      setTopic(initialTopic);
    }, [initialTopic]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setSourceFile(event.target?.result as string);
            };
            reader.onerror = () => {
                toast({ title: "Error reading file", variant: "destructive" });
            };
            reader.readAsDataURL(file); // Read as Data URL
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) {
            toast({ title: "Topic is required", variant: "destructive" });
            return;
        }
        if (!user) {
            toast({ title: "You must be logged in to create a course.", variant: "destructive" });
            return;
        }
        setIsGenerating(true);
        onCourseCreate(null); // Clear previous result
        try {
            const response = await myTutor({
                prompt: topic,
                researchMode: isResearchMode,
                sourceFile: useOwnSources ? sourceFile ?? undefined : undefined,
                courseStructure: defineStructure ? courseStructure : undefined,
                userId: user.uid,
            });
            onCourseCreate(response);
            toast({ title: "Success!", description: "Your course has been generated and saved." });
        } catch (error: any) {
            console.error('Failed to create course:', error);
            toast({ title: "Error", description: error.message || "Failed to create the course.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const suggestedTopics = ["Quantum Computing Basics", "The History of Ancient Rome", "Introduction to Javascript", "How to bake Sourdough Bread"];

    return (
        <>
            <form onSubmit={handleCreateCourse} className="space-y-8 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Define Your Topic</CardTitle>
                     <CardDescription>
                        What would you like to learn about today? Enter a topic to get started.
                    </CardDescription>
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
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Customize Your Learning</CardTitle>
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
                  <Button type="submit" size="lg" disabled={isGenerating || !topic}>
                    {isGenerating ? (
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
            </form>
            {isGenerating && (
                 <Card className="mt-6">
                    <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Our AI is crafting your personalized course...</p>
                        <p className="text-sm text-muted-foreground">This may take a moment.</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
};


// Component for the Talk Buddy chat interface
const TalkBuddyDisplay = () => {
    const { user } = useAuth();
    const [language, setLanguage] = useState('English');
    const [messages, setMessages] = useState<TalkBuddyMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US'; // This can be updated based on language selection

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                handleSendMessage(transcript); 
                setIsListening(false);
            };
            recognitionRef.current.onerror = (event: any) => {
                toast({ title: "Speech Recognition Error", description: event.error, variant: "destructive" });
                setIsListening(false);
            };
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            toast({ title: "Browser Not Supported", description: "Speech recognition is not supported in your browser.", variant: "destructive" });
        }
    }, [toast]);
    
    // Auto-scroll to the latest message
     useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);


    const handleSendMessage = useCallback(async (text: string) => {
        const currentMessage = text.trim();
        if (!currentMessage || !user) return;

        const userMessage: TalkBuddyMessage = { sender: 'user', text: currentMessage };
        const newMessages = [...messages, userMessage];
        
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response: TalkBuddyOutput = await talkBuddy({ 
                prompt: currentMessage,
                language,
                messages: newMessages.map(m => ({ sender: m.sender, text: m.text })), // Pass history without audioUrl
                userId: user.uid,
                conversationId,
            });

            const botMessage: TalkBuddyMessage = { sender: 'bot', text: response.responseText, audioUrl: response.audioUrl };
            setMessages(prev => [...prev, botMessage]);
            if(response.conversationId) setConversationId(response.conversationId);


            if (response.audioUrl && audioRef.current) {
                audioRef.current.src = response.audioUrl;
                audioRef.current.play().catch(e => console.error("Audio playback failed", e));
            }
        } catch (error) {
            console.error("Talk Buddy failed:", error);
            toast({ title: "Error", description: "Talk Buddy failed to respond.", variant: "destructive" });
            setMessages(prev => prev.slice(0, -1)); // Remove the user's message if the API call fails
        } finally {
            setIsLoading(false);
        }
    }, [messages, language, toast, user, conversationId]);
    
    const handleListen = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    }
    
    return (
        <Card className="mt-10">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Accessibility /> Voice-Enabled Tutor</CardTitle>
                        <CardDescription>Practice, ask questions, and learn through conversation.</CardDescription>
                    </div>
                </div>
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
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Marathi">Marathi</SelectItem>
                                <SelectItem value="Kannada">Kannada</SelectItem>
                                <SelectItem value="Tamil">Tamil</SelectItem>
                                <SelectItem value="Telugu">Telugu</SelectItem>
                                <SelectItem value="Bengali">Bengali</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                                <SelectItem value="Japanese">Japanese</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                    {msg.sender === 'bot' && <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><Bot className="h-5 w-5"/></div>}
                                    <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                    {msg.sender === 'user' && <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0"><UserIcon className="h-5 w-5"/></div>}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-end gap-3">
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
                             <Button variant="outline" onClick={handleListen} disabled={isLoading}>
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

// Wrapper component to avoid server/client component mismatch with Suspense
const MyTutorPageContent = () => {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const courseId = searchParams.get('courseId');
    const initialTab = searchParams.get('tab') === 'buddy' ? 'buddy' : 'create';
    const initialTopic = searchParams.get('topic') || '';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [result, setResult] = useState<MyTutorOutput | null>(null);
    const [loadingCourse, setLoadingCourse] = useState(false);

    useEffect(() => {
        const loadCourse = async () => {
            if (courseId && user) {
                setLoadingCourse(true);
                setResult(null);
                try {
                    const courseRef = doc(db, `users/${user.uid}/courses/${courseId}`);
                    const docSnap = await getDoc(courseRef);
                    if (docSnap.exists()) {
                        setResult(docSnap.data() as MyTutorOutput);
                    } else {
                        toast({ title: 'Course not found', variant: 'destructive' });
                    }
                } catch (error) {
                    toast({ title: 'Failed to load course', variant: 'destructive' });
                } finally {
                    setLoadingCourse(false);
                }
            }
        };
        loadCourse();
    }, [courseId, user, toast]);
    
    // When the tab or topic changes from URL, update the state
    useEffect(() => {
        if (!courseId) { // Only switch tab if not loading a specific course
             setActiveTab(initialTab);
        }
    }, [initialTab, courseId]);
    
    const handleCourseCreated = (output: MyTutorOutput | null) => {
        setResult(output);
    };

    return (
        <div className="container mx-auto max-w-6xl py-12 px-4">
             <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Adaptive AI Tutor</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Generate a personalized course with metacognitive feedback or use the voice-enabled tutor.
                </p>
            </div>
          
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create"><BookCopy className="mr-2"/> Create Course</TabsTrigger>
              <TabsTrigger value="buddy"><Accessibility className="mr-2"/> Voice Tutor</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
                 <CourseCreationForm onCourseCreate={handleCourseCreated} initialTopic={initialTopic} />
                 {loadingCourse && (
                    <Card className="mt-6">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Loading your course...</p>
                        </CardContent>
                    </Card>
                 )}
                 {result?.course && <CourseDisplay result={result} />}
            </TabsContent>
            <TabsContent value="buddy">
                <TalkBuddyDisplay />
            </TabsContent>
           </Tabs>
        </div>
    );
};


export default function MyTutorPage() {
    return (
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
            <MyTutorPageContent />
        </React.Suspense>
    );
}

    

    

    
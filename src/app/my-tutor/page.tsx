
'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    FileUp, 
    BookCopy, 
    Upload, 
    ChevronRight,
    List,
    Target,
    Clock,
    LayoutList,
    Lightbulb,
    Info,
    ChevronDown,
    Plus,
    Minus,
    Search,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Toggle } from '@/components/ui/toggle';
import { myTutor, MyTutorOutput } from '@/ai/flows/my-tutor';
import { useToast } from '@/hooks/use-toast';

const suggestedTopics = [
  "Productivity Mastery",
  "Creative Writing",
  "Public Speaking",
  "Financial Literacy",
  "Startup Fundamentals",
  "Growth Hacking",
  "Sustainable Living",
]

const initialStructureGuideItems = [
    { id: 'title', icon: List, text: "Course Title", content: <Input placeholder="Enter course title" name="title" /> },
    { id: 'outcomes', icon: Target, text: "Learning Outcomes", content: <Textarea placeholder="List what students will learn..." name="learningOutcomes" /> },
    { id: 'size', icon: Clock, text: "Course Size", content: (
        <div className="grid grid-cols-2 gap-4">
            <Input type="number" placeholder="Number of modules" name="modules" />
            <Input type="number" placeholder="Lessons per module" name="lessonsPerModule" />
        </div>
    )},
    { id: 'outline', icon: LayoutList, text: "Course Outline" },
    { id: 'methods', icon: Lightbulb, text: "Instructional Methods", content: <Textarea placeholder="Describe teaching methods..." name="instructionalMethods" /> },
    { id: 'details', icon: Info, text: "Additional Details", content: <Textarea placeholder="Add any other relevant details..." name="additionalDetails"/> },
];


function CourseOutlineEditor() {
    const [modules, setModules] = useState([{ id: 1, name: 'Module 1', lessons: [''] }]);

    const addModule = () => {
        setModules([...modules, { id: Date.now(), name: `Module ${modules.length + 1}`, lessons: [''] }]);
    };

    const removeModule = (id: number) => {
        setModules(modules.filter(module => module.id !== id));
    };

    const addLesson = (moduleId: number) => {
        setModules(modules.map(module => 
            module.id === moduleId ? { ...module, lessons: [...module.lessons, ''] } : module
        ));
    };

    return (
        <div className="space-y-4 pt-2">
            {modules.map((module, moduleIndex) => (
                 <div key={module.id} className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                         <Input 
                            defaultValue={module.name} 
                            className="bg-background flex-grow"
                         />
                         <Button onClick={() => addLesson(module.id)} size="sm">
                             <Plus className="h-4 w-4 mr-1" />
                             Add Lesson
                         </Button>
                         <Button onClick={() => removeModule(module.id)} variant="destructive" size="icon">
                             <Minus className="h-4 w-4" />
                         </Button>
                    </div>
                 </div>
            ))}
            <Button onClick={addModule} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
            </Button>
        </div>
    );
}


export default function MyTutorPage() {
  const [topic, setTopic] = useState('');
  const [useOwnSources, setUseOwnSources] = useState(false);
  const [defineStructure, setDefineStructure] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isResearchMode, setIsResearchMode] = useState(false);
  const [isListenerFriendMode, setIsListenerFriendMode] = useState(false);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MyTutorOutput | null>(null);
  const { toast } = useToast();

  const toggleSection = (id: string) => {
      setOpenSections(prev => ({...prev, [id]: !prev[id]}));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setSourceFile(dataUri);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast({ title: "Error", description: "Please enter a topic.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);

    let courseStructure;
    if (defineStructure) {
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        courseStructure = {
            title: formData.get('title') as string,
            learningOutcomes: formData.get('learningOutcomes') as string,
            courseSize: {
                modules: formData.get('modules') as string,
                lessonsPerModule: formData.get('lessonsPerModule') as string,
            },
            instructionalMethods: formData.get('instructionalMethods') as string,
            additionalDetails: formData.get('additionalDetails') as string,
        }
    }


    try {
      const response = await myTutor({
        prompt: topic,
        researchMode: isResearchMode,
        sourceFile: sourceFile || undefined,
        courseStructure: defineStructure ? courseStructure : undefined,
      });
      setResult(response);
    } catch (error) {
      console.error('Failed to create course:', error);
      toast({ title: "Error", description: "Failed to create course. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-6 font-headline">Create New Course</h1>
        <form onSubmit={handleCreateCourse}>
        <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Side */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Type a topic to instantly generate a course..."
                            className="h-11 text-sm pr-28"
                            />
                            <Button type="submit" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-8 text-xs sm:text-sm" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookCopy className="mr-2 h-4 w-4" />}
                                Create
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Toggle size="sm" variant="outline" pressed={isResearchMode} onPressedChange={setIsResearchMode}>
                                <Search className="mr-2 h-4 w-4" />
                                Research
                            </Toggle>
                            <Toggle size="sm" variant="outline" pressed={isListenerFriendMode} onPressedChange={setIsListenerFriendMode}>
                                <BookCopy className="mr-2 h-4 w-4" />
                                Listener Friend
                            </Toggle>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                                <Switch id="own-sources" checked={useOwnSources} onCheckedChange={setUseOwnSources} />
                                <div className="flex-1">
                                    <Label htmlFor="own-sources" className="font-semibold cursor-pointer">Use your own sources</Label>
                                    <p className="text-xs text-muted-foreground">Upload or select documents to build a course with your own content.</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                                <Switch id="define-structure" checked={defineStructure} onCheckedChange={setDefineStructure}/>
                                <div className="flex-1">
                                    <Label htmlFor="define-structure" className="font-semibold cursor-pointer">Define course structure</Label>
                                    <p className="text-xs text-muted-foreground">Generate and customize the structure before building the course.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Suggested Topics:</h3>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTopics.map((topicTxt) => (
                        <Button 
                            key={topicTxt} 
                            variant="secondary" 
                            size="sm"
                            type="button"
                            className="rounded-full bg-muted/80 hover:bg-muted text-xs"
                            onClick={() => setTopic(topicTxt)}
                        >
                            {topicTxt}
                        </Button>
                        ))}
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>

            <div className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-500 ease-in-out",
                (useOwnSources || defineStructure) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
            )}>
                {/* Upload Section */}
                <div className={cn("transition-opacity duration-300", useOwnSources ? "opacity-100" : "opacity-0 pointer-events-none")}>
                    {useOwnSources && (
                        <Card className="bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Select or Upload Files</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center text-center h-64">
                                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                    <p className="font-semibold mb-1">{fileName ? `Selected: ${fileName}` : 'Drop your files here'}</p>
                                    <p className="text-muted-foreground text-sm mb-4">or</p>
                                    <Button asChild variant="default">
                                        <label>
                                            <FileUp className="mr-2 h-4 w-4" />
                                            Upload files
                                            <Input type="file" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Structure Guide Section */}
                <div className={cn("transition-opacity duration-300", defineStructure ? "opacity-100" : "opacity-0 pointer-events-none")}>
                    {defineStructure && (
                        <Card className="bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Course Plan Structure Guide</CardTitle>
                                <p className="text-sm text-muted-foreground">Define your course structure to help generate more relevant content.</p>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-2">
                                    {initialStructureGuideItems.map((item) => (
                                        <Collapsible key={item.id} open={openSections[item.id] || false} onOpenChange={() => toggleSection(item.id)}>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-5 w-5 text-primary/80" />
                                                    <span className="font-medium">{item.text}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch defaultChecked />
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                                                            {openSections[item.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </div>
                                            </div>
                                            <CollapsibleContent className="px-3 py-2">
                                            {item.id === 'outline' ? <CourseOutlineEditor /> : item.content}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>
                                <Separator className="my-4" />
                                <div className="flex items-center justify-center text-center">
                                    <p className="text-sm text-muted-foreground">Or let AI generate them automatically from your own course plan</p>
                                    <Button variant="link" type="button">
                                        <FileUp className="mr-2 h-4 w-4" />
                                        Upload file
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {(loading || result) && (
                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Generated Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="ml-4 text-muted-foreground">Generating your course...</p>
                            </div>
                        )}
                        {result && (
                            <div className="prose dark:prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans">{result.courseContent}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </form>
    </div>
  );
}

    
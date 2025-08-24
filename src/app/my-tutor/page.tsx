
'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    BookOpen,
    GalleryHorizontal,
    GraduationCap
} from 'lucide-react';
import { myTutor, MyTutorOutput } from '@/ai/flows/my-tutor';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function MyTutorPage() {
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
      toast({ title: "Error", description: "Failed to create the course. Please check the console for details.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
  
  const suggestedTopics = ["Quantum Computing Basics", "The History of Ancient Rome", "Introduction to Javascript", "How to bake Sourdough Bread"];

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline">My AI Tutor</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Generate a personalized course on any topic, tailored to your needs.
        </p>
      </div>

      <form onSubmit={handleCreateCourse} className="space-y-8">
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
                    <div className="space-y-1">
                        <Label htmlFor="research-mode" className="font-semibold">Research Mode</Label>
                        <p className="text-xs text-muted-foreground">Perform a deeper, more thorough search for content.</p>
                    </div>
                    <Switch id="research-mode" checked={isResearchMode} onCheckedChange={setIsResearchMode} />
                </div>
                <div className="flex items-start space-x-4 rounded-lg border p-4">
                    <Upload className="h-6 w-6 mt-1 text-primary"/>
                    <div className="space-y-1">
                        <Label htmlFor="own-sources" className="font-semibold">Use Own Sources</Label>
                        <p className="text-xs text-muted-foreground">Upload a document to use as the primary source.</p>
                    </div>
                     <Switch id="own-sources" checked={useOwnSources} onCheckedChange={setUseOwnSources} />
                </div>
                 <div className="flex items-start space-x-4 rounded-lg border p-4">
                    <ClipboardList className="h-6 w-6 mt-1 text-primary"/>
                    <div className="space-y-1">
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

        {result && (
             <Card className="mt-10">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Your Course on "{topic}"</CardTitle>
                    <CardDescription className="pt-2">{result.explanation}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {result.audioUrl && (
                        <div className="pt-2">
                            <audio controls src={result.audioUrl} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}
                    
                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="content"><BookOpen className="mr-2"/>Course Content</TabsTrigger>
                            <TabsTrigger value="visual" disabled={!result.imageUrl}><GalleryHorizontal className="mr-2"/>Visual Aid</TabsTrigger>
                            <TabsTrigger value="resources" disabled={!result.relatedResources || result.relatedResources.length === 0}><GraduationCap className="mr-2"/>Further Learning</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="mt-4">
                             {result.courseContent ? (
                                 <div className="prose prose-lg dark:prose-invert max-w-none rounded-lg border bg-muted/20 p-6 whitespace-pre-wrap font-sans">
                                    {result.courseContent}
                                 </div>
                             ) : <p className="text-muted-foreground text-center py-8">No course content was generated.</p>}
                        </TabsContent>
                        <TabsContent value="visual" className="mt-4">
                            {result.imageUrl && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                     <Image src={result.imageUrl} alt="Generated image for the course" layout="fill" objectFit="cover" />
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="resources" className="mt-4">
                             {result.relatedResources && result.relatedResources.length > 0 && (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {result.relatedResources.map((resource, index) => (
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
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        )}
      </form>
    </div>
  );
}

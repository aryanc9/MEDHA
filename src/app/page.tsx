
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Accessibility, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function Shape({ className }: { className?: string }) {
  return <div className={className}></div>;
}

const features = [
    {
        title: 'Metacognitive Tools',
        description: 'Develop self-awareness with goal setting, reflection prompts, and AI-powered error analysis to understand your mistakes.',
        icon: <BrainCircuit className="w-8 h-8 text-primary" />,
        detailedExplanation: `
            <h3 class="font-bold text-lg mb-2">What it is:</h3>
            <p>Metacognitive Tools are features designed to help you "think about your thinking." Instead of just learning a topic, you learn *how* you learn it best. This includes setting clear learning goals, reflecting on what you found easy or difficult, and getting AI-driven feedback on your reflections to identify your own learning patterns.</p>
            <br/>
            <h3 class="font-bold text-lg mb-2">How it's used:</h3>
            <p>After completing a lesson or a quiz, the platform will prompt you to write a brief reflection. For example: "What was the most challenging concept in this lesson, and why do you think it was difficult?" Our AI analyzes your reflection not for correctness, but for depth of thought, and awards you points for insightful self-assessment, which improves your student score on the dashboard.</p>
            <br/>
            <h3 class="font-bold text-lg mb-2">Benefit to your learning:</h3>
            <p>This process strengthens your ability to learn independently. You become better at identifying your own knowledge gaps and developing strategies to overcome them, a crucial skill for lifelong learning.</p>
        `
    },
    {
        title: 'Accessibility First',
        description: 'Learn your way with voice commands, gesture controls, dyslexia-friendly fonts, and focus modes for ADHD.',
        icon: <Accessibility className="w-8 h-8 text-primary" />,
        detailedExplanation: `
            <h3 class="font-bold text-lg mb-2">What it is:</h3>
            <p>An "Accessibility First" approach means the platform is built from the ground up to be usable by everyone, regardless of their physical or cognitive abilities. This isn't an afterthought; it's a core part of the design.</p>
            <br/>
            <h3 class="font-bold text-lg mb-2">How it's used:</h3>
            <p>You can interact with the platform using your voice, utilize high-contrast themes, or switch to dyslexia-friendly fonts like OpenDyslexic. The "Talk Buddy" feature allows for conversational learning, and our uncluttered interface helps users with focus-related challenges like ADHD to concentrate on the learning material without distractions.</p>
            <br/>
            <h3 class="font-bold text-lg mb-2">Benefit to your learning:</h3>
            <p>By removing barriers to access, we ensure that the only challenge you face is the subject you're trying to learn. This creates a more inclusive and effective learning environment for all students.</p>
        `
    },
    {
        title: 'Adaptive Lessons',
        description: 'Experience truly personalized education that adapts in real-time to your pace, style, and learning needs.',
        icon: <Zap className="w-8 h-8 text-primary" />,
        detailedExplanation: `
            <h3 class="font-bold text-lg mb-2">What it is:</h3>
            <p>Adaptive lessons are courses that dynamically change based on your performance and interaction. The AI tutor doesn't follow a rigid, one-size-fits-all curriculum. It monitors your progress and adjusts the content on the fly.</p>
            <br/>
            <h3 class="font-bold text-lg mb-2">How it's used:</h3>
            <p>When you take a quiz at the end of a module, the AI analyzes your answers. If you struggle with a particular concept, the next lesson might include more foundational material on that topic or present it in a different way. If you're excelling, the AI might introduce more advanced concepts sooner or provide more challenging problems to keep you engaged.</p>
            <br/>
            <h3 class="font-bold text-lg mb-2">Benefit to your learning:</h3>
            <p>This personalization ensures you're always learning in your "zone of proximal development"—the sweet spot where content is challenging enough to be interesting but not so difficult that it's frustrating. It makes learning more efficient and effective.</p>
        `
    }
]

export default function HomePage() {
  const [selectedFeature, setSelectedFeature] = React.useState<(typeof features)[0] | null>(null);

  const handleFeatureClick = (feature: (typeof features)[0]) => {
    setSelectedFeature(feature);
  }

  const handleCloseDialog = () => {
    setSelectedFeature(null);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background text-foreground relative overflow-hidden">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight font-headline">
            The AI Tutor That Teaches You
            <br />
            <span className="text-primary">How to Learn</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
            Medha: Making Complex Concepts Simple with Adaptive AI Tutoring. Go beyond just knowing, and start understanding.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg" className="rounded-full font-semibold shadow-lg transition-transform transform hover:scale-105">
              <Link href="/dashboard">
                Start Your Learning Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <section className="pb-20">
            <h2 className="text-3xl font-bold text-center font-headline mb-10">A New Way to Master Any Subject</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {features.map((feature) => (
                    <Card 
                        key={feature.title} 
                        className="cursor-pointer hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        onClick={() => handleFeatureClick(feature)}
                    >
                        <CardHeader>
                            <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                               {feature.icon}
                            </div>
                            <CardTitle>{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </section>
      </main>

       <Dialog open={!!selectedFeature} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">{selectedFeature?.title}</DialogTitle>
                    <DialogDescription>
                        {selectedFeature?.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto pr-4 mt-4">
                    <div dangerouslySetInnerHTML={{ __html: selectedFeature?.detailedExplanation || "" }} />
                </div>
            </DialogContent>
        </Dialog>

      {/* Decorative Shapes */}
      <Shape className="absolute top-24 -left-20 w-40 h-40 bg-pink-300/20 rounded-full opacity-50 blur-xl" />
      <Shape className="absolute top-1/2 -left-10 w-48 h-48 bg-cyan-300/20 rounded-lg opacity-50 -rotate-12 blur-xl" />
      <Shape className="absolute bottom-10 left-20 w-32 h-32 bg-yellow-300/20 rounded-full opacity-50 rotate-45 blur-xl" />
      <Shape className="absolute top-20 -right-20 w-48 h-48 bg-red-400/20 rounded-full opacity-50 blur-xl" />
      <Shape className="absolute top-1/2 -right-10 w-40 h-40 bg-green-400/20 rounded-2xl opacity-50 rotate-12 blur-xl" />
      <Shape className="absolute bottom-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-lg opacity-50 blur-xl" />
    </div>
  );
}

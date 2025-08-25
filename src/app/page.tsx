
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Accessibility, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { explainFeature } from '@/ai/flows/explain-feature';

function Shape({ className }: { className?: string }) {
  return <div className={className}></div>;
}

const features = [
    {
        title: 'Metacognitive Tools',
        description: 'Develop self-awareness with goal setting, reflection prompts, and AI-powered error analysis to understand your mistakes.',
        icon: <BrainCircuit className="w-8 h-8 text-primary" />
    },
    {
        title: 'Accessibility First',
        description: 'Learn your way with voice commands, gesture controls, dyslexia-friendly fonts, and focus modes for ADHD.',
        icon: <Accessibility className="w-8 h-8 text-primary" />
    },
    {
        title: 'Adaptive Lessons',
        description: 'Experience truly personalized education that adapts in real-time to your pace, style, and learning needs.',
        icon: <Zap className="w-8 h-8 text-primary" />
    }
]

export default function HomePage() {
  const [selectedFeature, setSelectedFeature] = React.useState<{title: string, description: string} | null>(null);
  const [explanation, setExplanation] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFeatureClick = async (feature: {title: string, description: string}) => {
    setSelectedFeature(feature);
    setIsLoading(true);
    try {
        const result = await explainFeature({
            featureTitle: feature.title,
            featureDescription: feature.description
        });
        setExplanation(result.explanation);
    } catch(e) {
        setExplanation('Sorry, I could not fetch the explanation at this time.');
    } finally {
        setIsLoading(false);
    }
  }

  const handleCloseDialog = () => {
    setSelectedFeature(null);
    setExplanation('');
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
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />

                    )}
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

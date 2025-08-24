
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

const db = getFirestore(firebaseApp);

interface Essay {
    id: string;
    topic: string;
    submittedAt: {
        seconds: number;
        nanoseconds: number;
    };
    essay?: string;
    feedback?: any;
}


export default function HistoryPage() {
    const { user } = useAuth();
    const [essays, setEssays] = useState<Essay[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

    useEffect(() => {
        if (user) {
            const essaysQuery = query(
                collection(db, 'users', user.uid, 'essays'),
                orderBy('submittedAt', 'desc')
            );

            const unsubscribe = onSnapshot(essaysQuery, (querySnapshot) => {
                const essaysData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Essay));
                setEssays(essaysData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching essay history: ", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleEssaySelect = async (essayId: string) => {
        if (!user) return;
        
        const cachedEssay = essays.find(e => e.id === essayId);
        if (cachedEssay && cachedEssay.essay) {
            setSelectedEssay(cachedEssay);
            return;
        }

        const essayRef = doc(db, 'users', user.uid, 'essays', essayId);
        const docSnap = await getDoc(essayRef);
        if (docSnap.exists()) {
            const fullEssay = { id: docSnap.id, ...docSnap.data() } as Essay;
            setSelectedEssay(fullEssay);
            // Update the state with the full data to cache it
            setEssays(prev => prev.map(e => e.id === essayId ? fullEssay : e));
        }
    };
    

    return (
        <div className="container mx-auto max-w-6xl py-12 px-4">
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight font-headline">History</h1>
                <p className="text-muted-foreground mt-2">
                    Review your past submissions and generated content.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Essay Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading && <div className="flex justify-center items-center"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                            {!loading && essays.length === 0 && <p className="text-muted-foreground text-sm">No essays found.</p>}
                            <ul className="space-y-2">
                                {essays.map(essay => (
                                    <li key={essay.id}>
                                        <button 
                                            onClick={() => handleEssaySelect(essay.id)}
                                            className={`w-full text-left p-3 rounded-md transition-colors ${selectedEssay?.id === essay.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                        >
                                            <div className="font-semibold">{essay.topic}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {essay.submittedAt ? format(new Date(essay.submittedAt.seconds * 1000), 'PPP p') : 'No date'}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card className="sticky top-24">
                         <CardHeader>
                            <CardTitle>Details</CardTitle>
                            <CardDescription>
                                {selectedEssay ? `Showing details for "${selectedEssay.topic}"` : 'Select an item from the list to see the details.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedEssay && (
                                <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mb-4" />
                                    <p>Your content will appear here.</p>
                                </div>
                            )}
                            {selectedEssay && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Your Essay</h3>
                                        <p className="text-sm p-4 bg-muted/50 rounded-md whitespace-pre-wrap">{selectedEssay.essay}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">AI Feedback</h3>
                                        <Accordion type="single" collapsible className="w-full">
                                            {selectedEssay.feedback && Object.entries(selectedEssay.feedback).map(([key, value]) => (
                                                 <AccordionItem value={key} key={key}>
                                                    <AccordionTrigger className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</AccordionTrigger>
                                                    <AccordionContent>{String(value)}</AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
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

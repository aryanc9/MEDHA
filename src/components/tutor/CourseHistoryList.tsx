
'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { firebaseApp } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MyTutorOutput } from '@/ai/flows/my-tutor';

const db = getFirestore(firebaseApp);

interface CourseHistoryListProps {
  onSelectCourse: (courseId: string) => void;
}

export function CourseHistoryList({ onSelectCourse }: CourseHistoryListProps) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<MyTutorOutput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const coursesQuery = query(
      collection(db, `users/${user.uid}/courses`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      coursesQuery,
      (querySnapshot) => {
        const coursesData: MyTutorOutput[] = [];
        querySnapshot.forEach((doc) => {
          coursesData.push({ id: doc.id, ...doc.data() } as MyTutorOutput);
        });
        setCourses(coursesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Course History</CardTitle>
          <CardDescription>Your previously generated courses.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-10 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Course History</CardTitle>
        <CardDescription>Select a course from your history to review it.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[60vh]">
            {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-8">
                <BookOpen className="h-12 w-12 mb-4" />
                <p className="font-semibold">No courses generated yet.</p>
                <p className="text-sm">Create your first course from the "Create Course" tab.</p>
            </div>
            ) : (
            <div className="space-y-4">
                {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div>
                            <h3 className="font-semibold">{course.prompt}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {course.createdAt ? formatDistanceToNow(new Date(course.createdAt), { addSuffix: true }) : 'Recently'}
                            </p>
                        </div>
                        <Button onClick={() => onSelectCourse(course.id!)} variant="secondary" size="sm">
                            View Course
                        </Button>
                    </div>
                ))}
            </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


'use server';

/**
 * @fileOverview AI flows for generating and grading quizzes.
 *
 * - generateQuiz - Creates a quiz based on course content.
 * - gradeQuiz - Evaluates a user's quiz answers and awards points.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";
import { firebaseApp } from '@/lib/firebase';
import {
    GenerateQuizInputSchema, type GenerateQuizInput,
    GenerateQuizOutputSchema, type GenerateQuizOutput,
    GradeQuizInputSchema, type GradeQuizInput,
    GradeQuizOutputSchema, type GradeQuizOutput,
} from '@/ai/schemas/quiz-schemas';

const db = getFirestore(firebaseApp);

export type { GenerateQuizInput, GenerateQuizOutput, GradeQuizInput, GradeQuizOutput };

/**
 * Generates a quiz based on the provided course content.
 */
export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an expert educator. Based on the following course content, create a multiple-choice quiz with 5 to 7 questions to test the user's understanding.
For each question, provide 4 distinct options, one of which is the correct answer. Also, provide a brief explanation for why the answer is correct.

Course Content:
---
{{courseContent}}
---
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuizPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a quiz from the AI model.');
    }
    return output;
  }
);


/**
 * Grades a user's quiz submission and updates their score.
 */
export async function gradeQuiz(input: GradeQuizInput): Promise<GradeQuizOutput> {
    return gradeQuizFlow(input);
}

const gradeQuizFlow = ai.defineFlow(
  {
    name: 'gradeQuizFlow',
    inputSchema: GradeQuizInputSchema,
    outputSchema: GradeQuizOutputSchema,
  },
  async (input) => {
    let correctCount = 0;
    const feedback: z.infer<typeof GradeQuizOutputSchema>['feedback'] = [];

    input.userAnswers.forEach((userAnswer, index) => {
      const question = input.questions[index];
      const isCorrect = userAnswer.selectedAnswer === question.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }
      feedback.push({
        question: question.question,
        userAnswer: userAnswer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation,
      });
    });

    const score = (correctCount / input.questions.length) * 100;
    const pointsAwarded = correctCount * 5; // 5 points per correct answer

    // Update the user's score in Firestore
    if (pointsAwarded > 0 && input.userId) {
        const userDocRef = doc(db, 'users', input.userId);
        await updateDoc(userDocRef, {
            studentScore: increment(pointsAwarded)
        });
    }

    return {
      score: Math.round(score),
      pointsAwarded,
      feedback,
    };
  }
);

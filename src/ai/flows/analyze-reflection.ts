
'use server';

/**
 * @fileOverview Analyzes a student's reflection and awards points.
 *
 * - analyzeReflection - A function that evaluates a reflection and updates the student's score.
 * - AnalyzeReflectionInput - The input type for the function.
 * - AnalyzeReflectionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";
import { firebaseApp } from '@/lib/firebase';

const db = getFirestore(firebaseApp);

export const AnalyzeReflectionInputSchema = z.object({
  userId: z.string().describe("The user's unique ID."),
  reflectionText: z.string().describe("The student's written reflection on their learning."),
});
export type AnalyzeReflectionInput = z.infer<typeof AnalyzeReflectionInputSchema>;

export const AnalyzeReflectionOutputSchema = z.object({
    feedback: z.string().describe("Encouraging feedback on the student's reflection."),
    pointsAwarded: z.number().describe("Points awarded for the reflection (0-10)."),
});
export type AnalyzeReflectionOutput = z.infer<typeof AnalyzeReflectionOutputSchema>;

export async function analyzeReflection(input: AnalyzeReflectionInput): Promise<AnalyzeReflectionOutput> {
  return analyzeReflectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReflectionPrompt',
  input: { schema: AnalyzeReflectionInputSchema.omit({ userId: true }) },
  output: { schema: AnalyzeReflectionOutputSchema },
  prompt: `You are a metacognitive learning coach. Your task is to analyze a student's reflection on their learning process and award them points based on its quality.

  **Evaluation Criteria:**
  - **Depth of Thought:** Did the student go beyond a superficial summary? Do they identify specific concepts they found easy or difficult?
  - **Self-Awareness:** Does the student recognize their own thought processes, strengths, or weaknesses?
  - **Actionable Insights:** Does the student identify any strategies they could use to improve their learning in the future?

  **Scoring (0-10):**
  - **0-3 points:** Superficial reflection, e.g., "I learned a lot."
  - **4-7 points:** Some detail, identifies a challenge or a key learning, e.g., "I found the part about async/await confusing."
  - **8-10 points:** Deep, insightful reflection. Shows self-awareness and identifies concrete strategies for improvement, e.g., "I struggled with async/await because I was thinking of it like a simple callback. I will try to practice by building a small project that fetches data from an API to solidify my understanding."

  **Student's Reflection:**
  "{{reflectionText}}"

  Based on the criteria, provide brief, encouraging feedback and award points.
`,
});

const analyzeReflectionFlow = ai.defineFlow(
  {
    name: 'analyzeReflectionFlow',
    inputSchema: AnalyzeReflectionInputSchema,
    outputSchema: AnalyzeReflectionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }

    // Update the user's score in Firestore
    if (output.pointsAwarded > 0) {
        const userDocRef = doc(db, 'users', input.userId);
        await updateDoc(userDocRef, {
            studentScore: increment(output.pointsAwarded)
        });
    }

    return output;
  }
);

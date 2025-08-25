
import { z } from 'zod';

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

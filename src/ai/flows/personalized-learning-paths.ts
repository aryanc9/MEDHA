'use server';

/**
 * @fileOverview Provides AI-driven recommendations for learning modules based on student performance, incorporating spaced repetition.
 *
 * - getPersonalizedLearningPath - A function that returns personalized learning module recommendations.
 * - PersonalizedLearningPathInput - The input type for the getPersonalizedLearningPath function.
 * - PersonalizedLearningPathOutput - The return type for the getPersonalizedLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedLearningPathInputSchema = z.object({
  studentId: z.string().describe('Unique identifier for the student.'),
  performanceData: z.record(z.any()).describe('Record of student performance data on various modules.'),
  careerPath: z.string().describe('The career path the student is interested in.'),
  academicLevel: z.string().describe('The academic level of the student (e.g., high school, undergraduate).'),
});
export type PersonalizedLearningPathInput = z.infer<typeof PersonalizedLearningPathInputSchema>;

const PersonalizedLearningPathOutputSchema = z.object({
  moduleRecommendations: z.array(z.string()).describe('List of recommended learning module names.'),
  reasoning: z.string().describe('Explanation of why these modules were recommended.'),
});
export type PersonalizedLearningPathOutput = z.infer<typeof PersonalizedLearningPathOutputSchema>;

export async function getPersonalizedLearningPath(input: PersonalizedLearningPathInput): Promise<PersonalizedLearningPathOutput> {
  return personalizedLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedLearningPathPrompt',
  input: {schema: PersonalizedLearningPathInputSchema},
  output: {schema: PersonalizedLearningPathOutputSchema},
  prompt: `You are an AI-powered learning path recommendation system. You will analyze a student's performance data, their desired career path, and their academic level to recommend a list of learning modules tailored to their needs, incorporating spaced repetition principles.

Student ID: {{{studentId}}}
Career Path: {{{careerPath}}}
Academic Level: {{{academicLevel}}}
Performance Data: {{{performanceData}}}

Based on this information, provide a list of module recommendations and explain your reasoning. Follow spaced repetition principles and take into account the student's performance data to avoid topics they've already mastered, and topics they are not yet ready for.
Modules should be directly relevant to the student's career path, and adjust to the academic level.

Module Recommendations:`, 
});

const personalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathFlow',
    inputSchema: PersonalizedLearningPathInputSchema,
    outputSchema: PersonalizedLearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

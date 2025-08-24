
'use server';
/**
 * @fileOverview Provides feedback on essays focusing on grammar, coherence, relevance, and creativity.
 *
 * - essayFeedback - A function that provides feedback on an essay.
 * - EssayFeedbackInput - The input type for the essayFeedback function.
 * - EssayFeedbackOutput - The return type for the essayFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFirestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

const db = getFirestore(firebaseApp);

const EssayFeedbackInputSchema = z.object({
  essay: z.string().describe('The essay to provide feedback on.'),
  topic: z.string().describe('The topic of the essay.'),
  gradeLevel: z
    .string()
    .describe(
      'The grade level of the student who wrote the essay. e.g., 8th grade'
    ),
  userId: z.string().describe('The ID of the user submitting the essay.'),
});
export type EssayFeedbackInput = z.infer<typeof EssayFeedbackInputSchema>;

const EssayFeedbackOutputSchema = z.object({
  grammarFeedback: z.string().describe('Feedback on the grammar of the essay.'),
  coherenceFeedback:
    z.string().describe('Feedback on the coherence of the essay.'),
  relevanceFeedback:
    z.string().describe('Feedback on the relevance of the essay to the topic.'),
  creativityFeedback:
    z.string().describe('Feedback on the creativity of the essay.'),
  overallFeedback: z.string().describe('Overall feedback on the essay.'),
  essayId: z.string().describe('The ID of the saved essay document.'),
});

export type EssayFeedbackOutput = z.infer<typeof EssayFeedbackOutputSchema>;

export async function essayFeedback(
  input: EssayFeedbackInput
): Promise<EssayFeedbackOutput> {
  return essayFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'essayFeedbackPrompt',
  input: {schema: EssayFeedbackInputSchema},
  output: {schema: EssayFeedbackOutputSchema.omit({ essayId: true })},
  prompt: `You are an expert essay feedback provider for students. You will provide feedback on the following aspects of the essay:

- Grammar: Provide feedback on the grammar of the essay.
- Coherence: Provide feedback on the coherence of the essay. Does the essay flow well?
- Relevance: Provide feedback on the relevance of the essay to the topic. Does the essay address the topic?
- Creativity: Provide feedback on the creativity of the essay. Is the original and engaging?

Ensure that the feedback is appropriate for a {{gradeLevel}} student. Do not be condescending, encourage the student.

Topic: {{topic}}
Essay: {{essay}}`,
});

const essayFeedbackFlow = ai.defineFlow(
  {
    name: 'essayFeedbackFlow',
    inputSchema: EssayFeedbackInputSchema,
    outputSchema: EssayFeedbackOutputSchema,
  },
  async (input) => {
    // 1. Get AI feedback
    const {output: feedback} = await prompt(input);
    if (!feedback) {
        throw new Error('Failed to get feedback from the AI model.');
    }

    // 2. Save essay and feedback to Firestore
    const essayDocRef = doc(collection(db, 'users', input.userId, 'essays'));
    
    await setDoc(essayDocRef, {
      ...input,
      feedback,
      submittedAt: serverTimestamp(),
    });

    // 3. Return feedback and the new document ID
    return {
        ...feedback,
        essayId: essayDocRef.id,
    };
  }
);

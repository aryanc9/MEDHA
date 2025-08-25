
'use server';
/**
 * @fileOverview Provides feedback on essays focusing on grammar, coherence, relevance, and creativity.
 *
 * - essayFeedback - A function that provides feedback on an essay.
 * - EssayFeedbackInput - The input type for the essayFeedback function.
 * - EssayFeedbackOutput - The return type for the essayFeedback function.
 */

import {ai} from '@/ai/genkit';
import {
    EssayFeedbackInputSchema, 
    type EssayFeedbackInput, 
    EssayFeedbackOutputSchema, 
    type EssayFeedbackOutput
} from '@/ai/schemas/essay-feedback-schemas';

export type { EssayFeedbackInput, EssayFeedbackOutput };

export async function essayFeedback(
  input: EssayFeedbackInput
): Promise<EssayFeedbackOutput> {
  return essayFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'essayFeedbackPrompt',
  input: {schema: EssayFeedbackInputSchema},
  output: {schema: EssayFeedbackOutputSchema},
  prompt: `You are an expert essay feedback provider for students. You will provide feedback on the following aspects of the essay and also provide a revised version of the essay with highlighted changes.

- Grammar: Provide feedback on the grammar of the essay.
- Coherence: Provide feedback on the coherence of the essay. Does the essay flow well?
- Relevance: Provide feedback on the relevance of the essay to the topic. Does the essay address the topic?
- Creativity: Provide feedback on the creativity of the essay. Is it original and engaging?

Finally, create a revised version of the essay in the 'highlightedEssay' field. In this version, highlight your suggested changes directly in the text. Use Markdown's bold syntax ('**new text**') for any words you add or change, and use Markdown's strikethrough syntax ('~~deleted text~~') for any words you suggest removing.

Ensure that the feedback and suggestions are appropriate for a {{gradeLevel}} student. Do not be condescending; be encouraging.

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
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('Failed to get feedback from the AI model.');
    }
    return output;
  }
);


'use server';

/**
 * @fileOverview Handles conversational follow-ups for essay feedback.
 *
 * - essayFeedbackChat - A function that handles follow-up questions about essay feedback.
 * - EssayFeedbackChatInput - The input type for the function.
 * - EssayFeedbackChatOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    EssayFeedbackChatInputSchema,
    type EssayFeedbackChatInput,
    EssayFeedbackChatOutputSchema,
    type EssayFeedbackChatOutput,
} from '@/ai/schemas/essay-feedback-schemas';

export type { EssayFeedbackChatInput, EssayFeedbackChatOutput };


export async function essayFeedbackChat(
  input: EssayFeedbackChatInput
): Promise<EssayFeedbackChatOutput> {
  return essayFeedbackChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'essayFeedbackChatPrompt',
  input: { schema: EssayFeedbackChatInputSchema },
  output: { schema: EssayFeedbackChatOutputSchema },
  prompt: `You are an AI essay feedback assistant engaged in a follow-up conversation with a student. You have already provided initial feedback. Now, the student has a question or a request based on that feedback.

Your goal is to provide a helpful, concise response to the user's query. If the user asks you to revise the essay further, you MUST provide the complete, updated essay in the 'updatedEssay' field, incorporating their request and your original suggestions. Use Markdown's bold ('**new text**') for any words you add or change, and use Markdown's strikethrough ('~~deleted text~~') for any words you suggest removing.

**Context:**
- Student's Grade Level: {{gradeLevel}}
- Essay Topic: {{topic}}

**Original Essay:**
{{essay}}

**Your Initial Feedback:**
- Grammar: {{initialFeedback.grammarFeedback}}
- Coherence: {{initialFeedback.coherenceFeedback}}
- Relevance: {{initialFeedback.relevanceFeedback}}
- Creativity: {{initialFeedback.creativityFeedback}}
- Overall: {{initialFeedback.overallFeedback}}

**Initial Suggested Revisions:**
{{initialFeedback.highlightedEssay}}

**Conversation History:**
{{#each chatHistory}}
  {{#if (eq sender "user")}}User: {{text}}{{/if}}
  {{#if (eq sender "bot")}}AI: {{text}}{{/if}}
{{/each}}

**User's New Query:**
"{{query}}"

Based on this entire context, please provide your response. If you are updating the essay, make sure the 'updatedEssay' field contains the full text with all cumulative changes.
`,
});

const essayFeedbackChatFlow = ai.defineFlow(
  {
    name: 'essayFeedbackChatFlow',
    inputSchema: EssayFeedbackChatInputSchema,
    outputSchema: EssayFeedbackChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to get a response from the AI model.');
    }
    return output;
  }
);

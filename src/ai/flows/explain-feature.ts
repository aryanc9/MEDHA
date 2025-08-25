
'use server';

/**
 * @fileOverview Explains a feature of the Medha platform.
 *
 * - explainFeature - A function that provides a detailed explanation of a given feature.
 * - ExplainFeatureInput - The input type for the function.
 * - ExplainFeatureOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExplainFeatureInputSchema = z.object({
  featureTitle: z.string().describe('The title of the feature to explain.'),
  featureDescription: z.string().describe('The short description of the feature from the card.'),
});
export type ExplainFeatureInput = z.infer<typeof ExplainFeatureInputSchema>;

const ExplainFeatureOutputSchema = z.object({
  explanation: z.string().describe('A detailed, engaging, and easy-to-understand explanation of the feature, formatted in Markdown.'),
});
export type ExplainFeatureOutput = z.infer<typeof ExplainFeatureOutputSchema>;

export async function explainFeature(
  input: ExplainFeatureInput
): Promise<ExplainFeatureOutput> {
  return explainFeatureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainFeaturePrompt',
  input: {schema: ExplainFeatureInputSchema},
  output: {schema: ExplainFeatureOutputSchema},
  prompt: `You are an expert copywriter for Medha, an AI-powered learning platform.
Your task is to provide a clear, engaging, and detailed explanation of a specific feature for a user who has clicked on it.

The explanation should expand on the title and short description provided.
Explain what the feature is, how it works, and what the key benefits are for the student's learning journey.
Use Markdown for formatting (e.g., headings, bullet points, bold text) to make the explanation easy to read and digest.

Feature Title: {{featureTitle}}
Feature Description: {{featureDescription}}
`,
});

const explainFeatureFlow = ai.defineFlow(
  {
    name: 'explainFeatureFlow',
    inputSchema: ExplainFeatureInputSchema,
    outputSchema: ExplainFeatureOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to get an explanation from the AI model.');
    }
    return output;
  }
);

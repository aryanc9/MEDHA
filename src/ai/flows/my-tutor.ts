'use server';

/**
 * @fileOverview A comprehensive tutoring agent that can respond with text, images, and voice.
 *
 * - myTutor - A function that handles tutoring requests.
 * - MyTutorInput - The input type for the myTutor function.
 * - MyTutorOutput - The return type for the myTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { toWav } from '@/lib/audio';

const MyTutorInputSchema = z.object({
  prompt: z.string().describe('The user\'s question or topic to explain.'),
  image: z.string().optional().describe(
    "An optional image provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type MyTutorInput = z.infer<typeof MyTutorInputSchema>;

const MyTutorOutputSchema = z.object({
  textResponse: z.string().describe('The primary textual explanation or answer.'),
  imageUrl: z.string().optional().describe('URL of a generated image to supplement the explanation, if applicable.'),
  audioUrl: z.string().optional().describe('URL of a generated audio of the text response.'),
  chartData: z.any().optional().describe('Data for a chart, if applicable. Must be an array of objects with string/number values.'),
});
export type MyTutorOutput = z.infer<typeof MyTutorOutputSchema>;

export async function myTutor(input: MyTutorInput): Promise<MyTutorOutput> {
  return myTutorFlow(input);
}

const tutorPrompt = ai.definePrompt({
    name: 'tutorPrompt',
    input: { schema: MyTutorInputSchema },
    output: { schema: z.object({
        explanation: z.string().describe('The detailed explanation to the user\'s prompt.'),
        imagePrompt: z.string().optional().describe('A prompt to generate a helpful image, if needed.'),
        chartData: z.any().optional().describe("JSON data for a chart to visualize the explanation, if applicable. For example, to show historical data. The data should be an array of objects, like `[{'month': 'Jan', 'temp': 10}, {'month': 'Feb', 'temp': 12}]`"),
    })},
    prompt: `You are an expert AI tutor. Your goal is to explain complex topics in a clear and concise way. 
    Analyze the user's prompt and any provided image.
    Provide a textual explanation.
    If an image would be helpful to illustrate the concept, provide a detailed prompt for an image generation model to create it. For example, 'a diagram of the water cycle' or 'a photorealistic image of the andromeda galaxy'.
    If a chart or graph would be helpful, provide the data for it in a structured format (an array of objects).
    
    User Prompt: {{{prompt}}}
    {{#if image}}
    User Image: {{media url=image}}
    {{/if}}
    `
});

const myTutorFlow = ai.defineFlow(
  {
    name: 'myTutorFlow',
    inputSchema: MyTutorInputSchema,
    outputSchema: MyTutorOutputSchema,
  },
  async (input) => {
    const { output } = await tutorPrompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the tutor prompt.');
    }

    const { explanation, imagePrompt, chartData } = output;

    const promises: [Promise<string | undefined>, Promise<string | undefined>] = [
        Promise.resolve(undefined),
        Promise.resolve(undefined)
    ];

    if (imagePrompt) {
        promises[0] = (async () => {
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: imagePrompt,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
            return media?.url;
        })();
    }

    if (explanation) {
        promises[1] = (async () => {
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.5-flash-preview-tts',
                 config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Algenib' },
                        },
                    },
                },
                prompt: explanation,
            });
            if (!media) return undefined;
            const audioBuffer = Buffer.from(
                media.url.substring(media.url.indexOf(',') + 1),
                'base64'
            );
            const wavBase64 = await toWav(audioBuffer);
            return `data:audio/wav;base64,${wavBase64}`;
        })();
    }
    
    const [imageUrl, audioUrl] = await Promise.all(promises);

    return {
      textResponse: explanation || "I'm sorry, I couldn't come up with an explanation for that.",
      imageUrl,
      audioUrl,
      chartData,
    };
  }
);

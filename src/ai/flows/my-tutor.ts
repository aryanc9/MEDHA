
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

const CourseStructureSchema = z.object({
  title: z.string().optional(),
  learningOutcomes: z.string().optional(),
  courseSize: z.object({
    modules: z.string().optional(),
    lessonsPerModule: z.string().optional(),
  }).optional(),
  instructionalMethods: z.string().optional(),
  additionalDetails: z.string().optional(),
}).optional();


const MyTutorInputSchema = z.object({
  prompt: z.string().describe('The user\'s question or topic to explain.'),
  image: z.string().optional().describe(
    "An optional image provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  researchMode: z.boolean().optional().describe("If true, perform a deep search for the answer."),
  sourceFile: z.string().optional().describe(
    "A source file provided by the user, as a data URI that must include a MIME type and use Base64 encoding."
  ),
  courseStructure: CourseStructureSchema,
});
export type MyTutorInput = z.infer<typeof MyTutorInputSchema>;

const MyTutorOutputSchema = z.object({
  explanation: z.string().describe('The primary textual explanation or answer.'),
  imageUrl: z.string().optional().describe('URL of a generated image to supplement the explanation, if applicable.'),
  audioUrl: z.string().optional().describe('URL of a generated audio of the text response.'),
  chartData: z.any().optional().describe('Data for a chart, if applicable. Must be an array of objects with string/number values.'),
  courseContent: z.string().optional().describe("The generated course content based on the user's request."),
  relatedResources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(['video', 'article', 'other']),
  })).optional().describe('A list of related resources like YouTube videos or articles.'),
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
        courseContent: z.string().optional().describe("The generated course content based on the user's request. This should be a comprehensive course outline and content based on the prompt and any provided structure or source files. It should be well-formatted, likely using Markdown."),
        relatedResources: z.array(z.object({
            title: z.string().describe("The title of the resource."),
            url: z.string().url().describe("The URL of the resource."),
            type: z.enum(['video', 'article', 'other']).describe("The type of the resource."),
        })).optional().describe("A list of 2-3 relevant external resources like YouTube videos or articles."),
    })},
    prompt: `You are an expert AI course creator and tutor. Your goal is to generate a comprehensive course or provide a detailed explanation based on the user's request. Also find relevant external resources to supplement your answer.

    User Topic: {{{prompt}}}

    {{#if researchMode}}
    You are in research mode. Provide a deep, thorough, and detailed course on the topic. Go beyond a simple overview and include nuances, expert insights, and practical examples.
    {{/if}}

    {{#if sourceFile}}
    You have been provided with a source file. Use the content of this file as the primary basis for the course generation.
    Source File Content:
    {{{sourceFile}}}
    You can also use web sources to supplement the information if needed, but the provided file is the main context.
    {{/if}}

    {{#if courseStructure}}
    The user has provided a desired structure for the course. Adhere to this structure as closely as possible.
    
    Course Title: {{courseStructure.title}}
    Learning Outcomes: {{courseStructure.learningOutcomes}}
    Course Size: {{courseStructure.courseSize.modules}} modules, with {{courseStructure.courseSize.lessonsPerModule}} lessons per module.
    Instructional Methods: {{courseStructure.instructionalMethods}}
    Additional Details: {{courseStructure.additionalDetails}}
    {{/if}}

    {{#if image}}
    User Image: {{media url=image}}
    {{/if}}

    Based on all the provided information, generate the course content or a detailed explanation.
    
    In addition to the main response, find 2-3 highly relevant external resources (like YouTube videos or in-depth articles) that would help the user understand the topic better. Provide the title, URL, and type for each resource.
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

    const { explanation, imagePrompt, chartData, courseContent, relatedResources } = output;

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
      explanation: explanation || "I'm sorry, I couldn't come up with an explanation for that.",
      imageUrl,
      audioUrl,
      chartData,
      courseContent: courseContent || "Could not generate course content.",
      relatedResources,
    };
  }
);

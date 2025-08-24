
'use server';

/**
 * @fileOverview A comprehensive tutoring agent that can respond with text, images, and voice, and save interaction history.
 *
 * - myTutor - A function that handles tutoring requests and saves the output.
 * - MyTutorInput - The input type for the myTutor function.
 * - MyTutorOutput - The return type for the myTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { toWav } from '@/lib/audio';
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { firebaseApp } from '@/lib/firebase';

const db = getFirestore(firebaseApp);

const MyTutorInputSchema = z.object({
  prompt: z.string().describe("The user's question or topic to explain."),
  image: z.string().optional().describe(
    "An optional image provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  researchMode: z.boolean().optional().describe("If true, perform a deep search for the answer."),
  sourceFile: z.string().optional().describe(
    "A source file provided by the user, as a data URI that must include a MIME type and use Base64 encoding."
  ),
  courseStructure: z.string().optional().describe("A user-defined structure or plan for the course."),
  userId: z.string().describe("The user's unique ID to save history."),
});
export type MyTutorInput = z.infer<typeof MyTutorInputSchema>;

const CourseLessonSchema = z.object({
  title: z.string().describe("The title of the lesson."),
  content: z.string().describe("The detailed content of the lesson, formatted in Markdown using headings, bold text, and lists with '- ' markers."),
});

const CourseModuleSchema = z.object({
  title: z.string().describe("The title of the module."),
  lessons: z.array(CourseLessonSchema).describe("A list of lessons within the module."),
});

const CourseSchema = z.object({
    title: z.string().describe("The overall title of the generated course."),
    overview: z.string().describe("A brief overview of the entire course."),
    modules: z.array(CourseModuleSchema).describe("An array of course modules."),
});

const RelatedResourcesSchema = z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(['video', 'article', 'other']),
    videoId: z.string().optional().describe("The YouTube video ID if the resource is a YouTube video."),
}));


const MyTutorOutputSchema = z.object({
  explanation: z.string().describe('The primary textual explanation or answer.'),
  imageUrl: z.string().optional().describe('URL of a generated image to supplement the explanation, if applicable.'),
  audioUrl: z.string().optional().describe('URL of a generated audio of the text response.'),
  course: CourseSchema.optional().describe("The generated course content, structured into modules and lessons."),
  relatedResources: RelatedResourcesSchema.optional().describe('A list of related resources like YouTube videos or articles.'),
  id: z.string().optional().describe('The ID of the saved course document.'),
  courseId: z.string().optional().describe('The ID of the saved course document. DEPRECATED, use id instead.'),
  createdAt: z.string().optional().describe('The creation date of the course.'),
  prompt: z.string().optional().describe('The original prompt for the course.'),
});
export type MyTutorOutput = z.infer<typeof MyTutorOutputSchema>;

export async function myTutor(input: MyTutorInput): Promise<MyTutorOutput> {
  return myTutorFlow(input);
}

const tutorPrompt = ai.definePrompt({
    name: 'tutorPrompt',
    input: { schema: MyTutorInputSchema.omit({ userId: true }) },
    output: { schema: MyTutorOutputSchema.omit({ imageUrl: true, audioUrl: true, id: true, courseId: true, createdAt: true, prompt: true }) },
    prompt: `You are an expert AI course creator and tutor. Your goal is to generate a comprehensive, well-structured course based on the user's request. The course should be broken down into a logical hierarchy of modules and lessons. Also find relevant external resources to supplement your answer.

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
    The user has provided a desired structure or plan for the course. Adhere to this structure as closely as possible.
    Course Plan:
    {{{courseStructure}}}
    {{/if}}

    {{#if image}}
    User Image for context: {{media url=image}}
    {{/if}}

    Based on all the provided information, generate the course. Start with a brief, one-paragraph explanation of the topic. Then, generate the structured course content.
    - The course must have a main title and a brief overview.
    - The course must be divided into multiple modules.
    - Each module must contain multiple lessons.
    - Each lesson must have a title and detailed content formatted in Markdown. Use headings, bold text, and for lists, use a "- " marker for each item.
    
    In addition to the main response, find 5-7 highly relevant external resources. For YouTube videos, ensure they are from reputable, educational channels and are publicly available to watch. Provide the title, URL, and type for each resource. If a resource is a YouTube video, please extract and provide its unique video ID from the URL.
    `
});

const imageGenerationPrompt = ai.definePrompt({
    name: 'imageGenerationPrompt',
    input: { schema: z.object({ topic: z.string() }) },
    output: { schema: z.object({ imagePrompt: z.string().describe('A prompt for DALL-E to generate a helpful image, if one would be useful.') }) },
    prompt: `Generate a suitable image prompt for a course on the topic: {{{topic}}}. The prompt should be creative and result in an image that is visually appealing and relevant to the subject.`
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

    const { explanation, course, relatedResources } = output;

    // Generate image and audio in parallel
    const [imageUrlResult, audioUrlResult] = await Promise.allSettled([
        (async () => {
            try {
                const { output: imagePromptOutput } = await imageGenerationPrompt({ topic: input.prompt });
                if (!imagePromptOutput?.imagePrompt) return undefined;
                const { media } = await ai.generate({
                    model: 'googleai/gemini-2.0-flash-preview-image-generation',
                    prompt: imagePromptOutput.imagePrompt,
                    config: {
                        responseModalities: ['TEXT', 'IMAGE'],
                    },
                });
                return media?.url;
            } catch (e) {
                console.error("Image generation failed:", e);
                return undefined;
            }
        })(),
        (async () => {
            if (!explanation) return undefined;
            try {
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
            } catch (e) {
                console.warn("TTS generation failed, likely due to quota. Skipping.", e);
                return undefined;
            }
        })()
    ]);

    const imageUrl = imageUrlResult.status === 'fulfilled' ? imageUrlResult.value : undefined;
    const audioUrl = audioUrlResult.status === 'fulfilled' ? audioUrlResult.value : undefined;
    
    if (imageUrlResult.status === 'rejected') {
        console.error("Image generation failed:", imageUrlResult.reason);
    }
    if (audioUrlResult.status === 'rejected') {
        console.error("TTS generation failed:", audioUrlResult.reason);
    }
    
    // Create the final result object to be saved and returned
    const finalResult: MyTutorOutput = {
      explanation: explanation || "I'm sorry, I couldn't come up with an explanation for that.",
      imageUrl,
      audioUrl,
      course,
      relatedResources: relatedResources || [],
      prompt: input.prompt,
    };
    
    // Save to Firestore
    try {
        const courseId = doc(collection(db, `users/${input.userId}/courses`)).id;
        const courseDocRef = doc(db, `users/${input.userId}/courses/${courseId}`);

        const historyData = {
            ...finalResult,
            id: courseId, // Ensure the document ID is saved within the document
            createdAt: new Date().toISOString(), // Use a standardized timestamp
        };
        
        // Remove excessively large image data URIs before saving if necessary
        if (historyData.imageUrl && historyData.imageUrl.length > 1048487) {
            historyData.imageUrl = undefined;
        }

        await setDoc(courseDocRef, historyData);

        // Attach the ID and createdAt timestamp to the object returned to the client
        finalResult.id = courseId;
        finalResult.createdAt = historyData.createdAt;

    } catch(error) {
        console.error("Failed to save course history:", error);
        // Don't block the response if saving fails, just return the generated content
    }

    return finalResult;
  }
);


'use server';

/**
 * @fileOverview A comprehensive tutoring agent that creates adaptive courses with metacognitive feedback.
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
  reflectionPrompt: z.string().optional().describe("A metacognitive prompt to encourage the student to reflect on the lesson's content or their learning process."),
  relatedResources: RelatedResourcesSchema.optional().describe('A list of related resources like YouTube videos or articles.'),
  id: z.string().optional().describe('The ID of the saved course document.'),
  createdAt: z.string().optional().describe('The creation date of the course.'),
  prompt: z.string().optional().describe('The original prompt for the course.'),
});
export type MyTutorOutput = z.infer<typeof MyTutorOutputSchema>;

export async function myTutor(input: MyTutorInput): Promise<MyTutorOutput> {
  return myTutorFlow(input);
}

const findWebImage = ai.defineTool(
    {
        name: 'findWebImage',
        description: 'Find a real-world image or diagram from the web for a given topic. Use this when a photo or existing diagram is more appropriate than a generated AI image.',
        inputSchema: z.object({ query: z.string() }),
        outputSchema: z.object({ imageUrl: z.string().url() }),
    },
    async ({ query }) => {
        // In a real application, this would call an image search API (e.g., Google Custom Search, Unsplash).
        // For this prototype, we will return a placeholder to simulate the search.
        console.log(`Simulating image search for: ${query}`);
        return { imageUrl: `https://placehold.co/1280x720.png?text=Real+Image+of+${encodeURIComponent(query)}` };
    }
);

const imageGenerationPrompt = ai.definePrompt({
    name: 'imageGenerationPrompt',
    input: { schema: z.object({ topic: z.string() }) },
    output: { schema: z.object({ imagePrompt: z.string().describe('A prompt for an image generation model to create a helpful, visually appealing image for a course on the given topic.') }) },
    prompt: `Based on the user's topic, generate a creative and suitable image prompt for a course on the topic: {{{topic}}}. The prompt should result in an image that is visually appealing and relevant to the subject.
    `
});

const tutorPrompt = ai.definePrompt({
    name: 'tutorPrompt',
    input: { schema: MyTutorInputSchema.omit({ userId: true }) },
    output: { schema: MyTutorOutputSchema.omit({ imageUrl: true, audioUrl: true, id: true, createdAt: true, prompt: true }) },
    tools: [findWebImage],
    prompt: `You are an expert AI course creator and a metacognitive learning coach. Your goal is to generate a comprehensive, well-structured course and to help the student learn how to learn. You also have tools to find resources.

    **Visual Aid Decision:**
    Before responding, you must decide what kind of visual aid is most appropriate for the user's topic.
    - If the topic is best explained with a real-world photograph, a diagram, or a specific, existing image (e.g., 'a photo of the Eiffel Tower', 'a diagram of a plant cell'), use the 'findWebImage' tool. Do NOT create an image prompt in this case.
    - If the topic is abstract, conceptual, or would benefit from a creative, AI-generated image (e.g., 'a visual metaphor for creativity', 'an imaginative landscape'), you will later create a prompt for an image generation model. Do NOT use the tool in this case.
    - If no visual aid is necessary, do not use the tool or create an image prompt.

    **Core Task:**
    Generate a course on the user's topic. It should be broken down into a logical hierarchy of modules and lessons. Each lesson must have detailed content.

    **Metacognitive Task:**
    After generating the course content, create ONE insightful reflection prompt. This prompt should encourage the student to think about their learning process, connect concepts, or analyze potential difficulties related to the topic. For example: "What was the most confusing part of this topic, and what strategy could you use to understand it better?" or "How does this concept connect to what you already know about [related topic]?".

    **Resource Task:**
    Find 5-7 highly relevant external resources (videos, articles) to supplement the lesson. For YouTube videos, ensure they are from reputable channels and provide the video ID.

    **User Request Details:**
    User Topic: {{{prompt}}}

    {{#if researchMode}}
    You are in research mode. Provide a deep, thorough, and detailed course on the topic.
    {{/if}}

    {{#if sourceFile}}
    Use the following file as the primary source material:
    {{{sourceFile}}}
    {{/if}}

    {{#if courseStructure}}
    Adhere to this user-provided course structure:
    {{{courseStructure}}}
    {{/if}}

    {{#if image}}
    User Image for context: {{media url=image}}
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
    // Step 1: Generate the core text content and decide on the visual aid strategy.
    const llmResponse = await tutorPrompt(input);
    
    if (!llmResponse.output) {
      console.error("Tutor prompt failed, possibly due to rate limiting. Check your Google AI plan and quota.");
      throw new Error('Failed to get a response from the AI. You may have exceeded your usage quota.');
    }

    const { explanation, course, relatedResources, reflectionPrompt } = llmResponse.output;

    // Step 2: Handle image generation logic based on the LLM's decision.
    let imageUrl: string | undefined;

    // Check if the model decided to use the findWebImage tool.
    const toolRequest = llmResponse.requests?.find(r => r.toolRequest.name === 'findWebImage');
    if (toolRequest) {
        const toolResponse = await toolRequest.run();
        imageUrl = (toolResponse as { imageUrl: string }).imageUrl;
    } else {
        // If the tool wasn't used, proceed with AI image generation logic.
        try {
            const { output: imagePromptOutput } = await imageGenerationPrompt({ topic: input.prompt });
            if (imagePromptOutput?.imagePrompt) {
                const { media } = await ai.generate({
                    model: 'googleai/gemini-2.0-flash-preview-image-generation',
                    prompt: imagePromptOutput.imagePrompt,
                    config: {
                        responseModalities: ['TEXT', 'IMAGE'],
                    },
                });
                imageUrl = media?.url;
            }
        } catch (e) {
            console.warn("AI image generation failed, likely due to quota. Skipping image.", e);
            imageUrl = undefined;
        }
    }
     
    // Step 3: Generate audio in parallel.
    const audioUrl = await (async () => {
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
                console.warn("TTS generation failed, likely due to quota. Skipping audio.", e);
                return undefined;
            }
        })();
    
    // Step 4: Assemble the final result object.
    const finalResult: MyTutorOutput = {
      explanation: explanation || "I'm sorry, I couldn't come up with an explanation for that.",
      imageUrl,
      audioUrl,
      course,
      reflectionPrompt,
      relatedResources: relatedResources || [],
      prompt: input.prompt,
    };
    
    // Step 5: Save the complete result to Firestore.
    try {
        const courseId = doc(collection(db, `users/${input.userId}/courses`)).id;
        const courseDocRef = doc(db, `users/${input.userId}/courses/${courseId}`);

        const historyData = {
            ...finalResult,
            id: courseId,
            createdAt: new Date().toISOString(),
        };
        
        // Prevent overly large data URIs from being saved to Firestore.
        if (historyData.imageUrl && historyData.imageUrl.startsWith('data:image')) {
            console.warn("Generated image is a data URI, omitting from history to avoid size issues.");
            historyData.imageUrl = `https://placehold.co/1280x720.png?text=AI+Generated+Image`;
        }

         if (historyData.audioUrl && historyData.audioUrl.length > 1048487) {
            console.warn("Generated audio is too large for Firestore, omitting from history.");
            historyData.audioUrl = undefined;
        }

        await setDoc(courseDocRef, historyData);

        // Attach the ID and timestamp to the object returned to the client.
        finalResult.id = courseId;
        finalResult.createdAt = historyData.createdAt;

    } catch(error) {
        console.error("Failed to save course history:", error);
        // Do not block the response if saving fails, just return the generated content.
    }

    return finalResult;
  }
);

    

import { z } from 'zod';

export const TalkBuddyMessageSchema = z.object({
    sender: z.enum(['user', 'bot']),
    text: z.string(),
    audioUrl: z.string().optional().nullable(),
});
export type TalkBuddyMessage = z.infer<typeof TalkBuddyMessageSchema>;

export const TalkBuddyInputSchema = z.object({
  prompt: z.string().describe("The user's message to the buddy."),
  language: z.string().describe('The language for the conversation, e.g., "English", "Spanish", "Hindi".'),
  messages: z.array(TalkBuddyMessageSchema).optional().describe("The history of the conversation for context."),
});
export type TalkBuddyInput = z.infer<typeof TalkBuddyInputSchema>;

export const TalkBuddyOutputSchema = z.object({
  responseText: z.string().describe('The AI buddy\'s textual response.'),
  audioUrl: z.string().optional().describe('URL of the generated audio for the response.'),
});
export type TalkBuddyOutput = z.infer<typeof TalkBuddyOutputSchema>;


import { z } from 'zod';

export const TalkBuddyInputSchema = z.object({
  prompt: z.string().describe("The user's message to the buddy."),
  language: z.string().describe('The language for the conversation, e.g., "English", "Spanish", "Hindi".'),
  userId: z.string().optional().describe("The user's ID."),
  conversationId: z.string().optional().describe("The existing conversation ID to continue a chat."),
  messages: z.array(z.object({
      sender: z.enum(['user', 'bot']),
      text: z.string(),
      audioUrl: z.string().optional(),
  })).optional().describe("The history of the conversation."),
});
export type TalkBuddyInput = z.infer<typeof TalkBuddyInputSchema>;

export const TalkBuddyOutputSchema = z.object({
  responseText: z.string().describe('The AI buddy\'s textual response.'),
  audioUrl: z.string().optional().describe('URL of the generated audio for the response.'),
  conversationId: z.string().optional().describe("The ID of the conversation session."),
});
export type TalkBuddyOutput = z.infer<typeof TalkBuddyOutputSchema>;

    
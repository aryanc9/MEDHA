
import { z } from 'zod';

export const EssayFeedbackInputSchema = z.object({
  essay: z.string().describe('The essay to provide feedback on.'),
  topic: z.string().describe('The topic of the essay.'),
  gradeLevel: z
    .string()
    .describe(
      'The grade level of the student who wrote the essay. e.g., 8th grade'
    ),
});
export type EssayFeedbackInput = z.infer<typeof EssayFeedbackInputSchema>;

export const EssayFeedbackOutputSchema = z.object({
  grammarFeedback: z.string().describe('Feedback on the grammar of the essay.'),
  coherenceFeedback:
    z.string().describe('Feedback on the coherence of the essay.'),
  relevanceFeedback:
    z.string().describe('Feedback on the relevance of the essay to the topic.'),
  creativityFeedback:
    z.string().describe('Feedback on the creativity of the essay.'),
  overallFeedback: z.string().describe('Overall feedback on the essay.'),
  highlightedEssay: z.string().describe("The original essay with suggested improvements. Use Markdown's bold (`**text**`) for additions and strikethrough (`~~text~~`) for deletions.")
});
export type EssayFeedbackOutput = z.infer<typeof EssayFeedbackOutputSchema>;


export const ChatMessageSchema = z.object({
    sender: z.enum(['user', 'bot']),
    text: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const EssayFeedbackChatInputSchema = z.object({
  essay: z.string().describe('The original essay.'),
  topic: z.string().describe('The topic of the essay.'),
  gradeLevel: z.string().describe('The grade level of the student.'),
  initialFeedback: EssayFeedbackOutputSchema.describe("The initial feedback provided by the AI."),
  chatHistory: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  query: z.string().describe("The user's latest query or request."),
});
export type EssayFeedbackChatInput = z.infer<typeof EssayFeedbackChatInputSchema>;

export const EssayFeedbackChatOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user's query."),
  updatedEssay: z.string().optional().describe("The updated essay with new revisions, if the user requested changes. Use Markdown's bold (`**text**`) for additions and strikethrough (`~~text~~`) for deletions."),
});
export type EssayFeedbackChatOutput = z.infer<typeof EssayFeedbackChatOutputSchema>;

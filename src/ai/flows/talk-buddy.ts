
'use server';

/**
 * @fileOverview A real-time, multilingual conversational AI called "Talk Buddy" with history.
 *
 * - talkBuddy - A function that handles conversational interactions.
 * - TalkBuddyInput - The input type for the talkBuddy function.
 * - TalkBuddyOutput - The return type for the talkBuddy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { toWav } from '@/lib/audio';
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { firebaseApp } from '@/lib/firebase';
import {
  TalkBuddyInputSchema,
  type TalkBuddyInput,
  TalkBuddyOutputSchema,
  type TalkBuddyOutput,
} from '@/ai/schemas/talk-buddy-schemas';

const db = getFirestore(firebaseApp);

export async function talkBuddy(input: TalkBuddyInput): Promise<TalkBuddyOutput> {
  return talkBuddyFlow(input);
}

const buddyPrompt = ai.definePrompt({
  name: 'talkBuddyPrompt',
  input: { schema: TalkBuddyInputSchema.pick({ prompt: true, language: true, messages: true }) },
  output: { schema: z.object({ responseText: z.string() }) },
  prompt: `You are "Talk Buddy," a friendly and knowledgeable AI language partner. Your goal is to have a natural conversation with the user.

You MUST identify the language of the user's last message and respond in that same language.

Conversation History (for context):
{{#each messages}}
  {{sender}}: {{text}}
{{/each}}

User's latest message: "{{{prompt}}}"

Your response should be helpful, engaging, and encouraging. Keep your responses concise and conversational.`,
});

const talkBuddyFlow = ai.defineFlow(
  {
    name: 'talkBuddyFlow',
    inputSchema: TalkBuddyInputSchema,
    outputSchema: TalkBuddyOutputSchema,
  },
  async (input) => {
    // 1. Get the text response from the AI.
    const { output } = await buddyPrompt(input);
    if (!output) {
      throw new Error('Talk Buddy did not provide a text response.');
    }
    const { responseText } = output;

    let audioUrl: string | undefined;

    // 2. Generate audio for the response in parallel.
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
        prompt: responseText,
      });

      if (media) {
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        const wavBase64 = await toWav(audioBuffer);
        audioUrl = `data:audio/wav;base64,${wavBase64}`;
      }
    } catch (e) {
      console.warn("Talk Buddy TTS generation failed, skipping audio.", e);
    }
    
    const finalResult: TalkBuddyOutput = { responseText, audioUrl };

    // 3. Save conversation to Firestore
    try {
        const conversationId = input.conversationId || doc(collection(db, 'users', input.userId, 'conversations')).id;
        const conversationDocRef = doc(db, `users/${input.userId}/conversations/${conversationId}`);

        const userMessage = { sender: 'user', text: input.prompt };
        const botMessage = { sender: 'bot', text: responseText, audioUrl: audioUrl };
        
        const updatedMessages = [...(input.messages || []), userMessage, botMessage];

        await setDoc(conversationDocRef, {
            id: conversationId,
            title: input.messages && input.messages.length > 0 ? input.messages[0].text : input.prompt,
            messages: updatedMessages,
            language: input.language,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }, { merge: true });

        finalResult.conversationId = conversationId;

    } catch (error) {
        console.error("Failed to save conversation history:", error);
    }

    return finalResult;
  }
);

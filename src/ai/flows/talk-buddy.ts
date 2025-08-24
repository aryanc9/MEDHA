
'use server';

/**
 * @fileOverview A real-time, multilingual conversational AI called "Talk Buddy".
 *
 * - talkBuddy - A function that handles conversational interactions.
 * - TalkBuddyInput - The input type for the talkBuddy function.
 * - TalkBuddyOutput - The return type for the talkBuddy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { toWav } from '@/lib/audio';
import {
  TalkBuddyInputSchema,
  type TalkBuddyInput,
  TalkBuddyOutputSchema,
  type TalkBuddyOutput
} from '@/ai/schemas/talk-buddy-schemas';
import { getFirestore, doc, setDoc, serverTimestamp, collection, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

const db = getFirestore(firebaseApp);


export async function talkBuddy(input: TalkBuddyInput): Promise<TalkBuddyOutput> {
  return talkBuddyFlow(input);
}

const buddyPrompt = ai.definePrompt({
  name: 'talkBuddyPrompt',
  input: { schema: TalkBuddyInputSchema.pick({ prompt: true, language: true }) },
  output: { schema: z.object({ responseText: z.string() }) },
  prompt: `You are "Talk Buddy," a friendly and knowledgeable AI language partner. Your goal is to have a natural conversation with the user, answer their questions on any topic, and help them practice speaking in their desired language.

  Current Conversation Language: {{{language}}}

  User's message: "{{{prompt}}}"

  Your response should be in {{{language}}}. Be helpful, engaging, and encouraging. Keep your responses concise and conversational.`,
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

    // 3. Save conversation to Firestore
    if (input.userId && input.conversationId) {
        const conversationDocRef = doc(db, 'users', input.userId, 'conversations', input.conversationId);
        // Append new messages to the existing conversation
        const updatedMessages = [
            ...input.messages,
            { sender: 'user', text: input.prompt },
            { sender: 'bot', text: responseText, audioUrl }
        ];
        await updateDoc(conversationDocRef, { messages: updatedMessages, lastUpdatedAt: serverTimestamp() });
    } else if (input.userId) {
        // Create a new conversation document
        const conversationDocRef = doc(collection(db, 'users', input.userId, 'conversations'));
        const newConversation = {
            id: conversationDocRef.id,
            userId: input.userId,
            language: input.language,
            startedAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp(),
            title: `Conversation in ${input.language}`,
            messages: [
                { sender: 'user', text: input.prompt },
                { sender: 'bot', text: responseText, audioUrl }
            ]
        };
        await setDoc(conversationDocRef, newConversation);
        input.conversationId = conversationDocRef.id;
    }


    return { responseText, audioUrl, conversationId: input.conversationId };
  }
);

    
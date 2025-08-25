
import { config } from 'dotenv';
config();

import '@/ai/flows/essay-feedback.ts';
import '@/ai/flows/my-tutor.ts';
import '@/ai/flows/talk-buddy.ts';
import '@/ai/schemas/talk-buddy-schemas.ts';
import '@/ai/schemas/reflection-schemas.ts';
import '@/ai/flows/essay-feedback-chat.ts';
import '@/ai/flows/analyze-reflection.ts';
import '@/ai/flows/quiz-flow.ts';
import '@/ai/schemas/quiz-schemas.ts';

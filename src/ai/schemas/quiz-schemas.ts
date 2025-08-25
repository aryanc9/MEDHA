
import { z } from 'zod';

// Schema for a single quiz question
export const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('An array of 4 multiple-choice options.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
  explanation: z.string().describe("A brief explanation for why the answer is correct."),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Input for the quiz generation flow
export const GenerateQuizInputSchema = z.object({
  courseContent: z.string().describe('The full content of the course to base the quiz on.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

// Output for the quiz generation flow
export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of 5-10 quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


// Input for the quiz grading flow
export const GradeQuizInputSchema = z.object({
    userId: z.string().describe("The user's unique ID."),
    questions: z.array(QuizQuestionSchema).describe("The original questions that were asked."),
    userAnswers: z.array(z.object({
        question: z.string(),
        selectedAnswer: z.string(),
    })).describe("The user's selected answers for each question."),
});
export type GradeQuizInput = z.infer<typeof GradeQuizInputSchema>;


// Output for the quiz grading flow
export const GradeQuizOutputSchema = z.object({
    score: z.number().describe("The percentage of correct answers (0-100)."),
    pointsAwarded: z.number().describe("The total points awarded (e.g., 5 points per correct answer)."),
    feedback: z.array(z.object({
        question: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
        isCorrect: z.boolean(),
        explanation: z.string().describe("Explanation for the correct answer, especially if the user was wrong."),
    })).describe("Detailed feedback for each question."),
});
export type GradeQuizOutput = z.infer<typeof GradeQuizOutputSchema>;

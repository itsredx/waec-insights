'use server';

import { answerWAECDataQuestions } from '@/ai/flows/answer-waec-data-questions';
import { z } from 'zod';

const QuestionSchema = z.string().min(1, "Question cannot be empty.");

export async function askQuestion(question: string): Promise<string> {
  try {
    const validatedQuestion = QuestionSchema.parse(question);
    const response = await answerWAECDataQuestions({ question: validatedQuestion });
    return response.answer;
  } catch (error) {
    console.error("Error in askQuestion server action:", error);
    if (error instanceof z.ZodError) {
        return "Invalid question provided.";
    }
    // Simulate a more "natural" error response
    await new Promise(resolve => setTimeout(resolve, 500));
    return "I'm sorry, but I encountered an issue while trying to answer your question. The dataset might not contain the information you're looking for, or there might be a temporary problem. Please try rephrasing your question or ask something different.";
  }
}

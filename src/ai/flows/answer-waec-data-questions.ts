// src/ai/flows/answer-waec-data-questions.ts
'use server';

/**
 * @fileOverview An AI agent that answers questions about WAEC data.
 *
 * - answerWAECDataQuestions - A function that answers questions about WAEC data.
 * - AnswerWAECDataQuestionsInput - The input type for the answerWAECDataQuestions function.
 * - AnswerWAECDataQuestionsOutput - The return type for the answerWAECDataQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerWAECDataQuestionsInputSchema = z.object({
  question: z.string().describe('The question about WAEC data.'),
});
export type AnswerWAECDataQuestionsInput = z.infer<typeof AnswerWAECDataQuestionsInputSchema>;

const AnswerWAECDataQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about WAEC data.'),
});
export type AnswerWAECDataQuestionsOutput = z.infer<typeof AnswerWAECDataQuestionsOutputSchema>;

export async function answerWAECDataQuestions(input: AnswerWAECDataQuestionsInput): Promise<AnswerWAECDataQuestionsOutput> {
  return answerWAECDataQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerWAECDataQuestionsPrompt',
  input: {schema: AnswerWAECDataQuestionsInputSchema},
  output: {schema: AnswerWAECDataQuestionsOutputSchema},
  prompt: `You are an AI assistant that has access to WAEC (West African Examinations Council) data from 2016-2021.
Use this data to answer the following question as accurately as possible:

Question: {{{question}}}`,
});

const answerWAECDataQuestionsFlow = ai.defineFlow(
  {
    name: 'answerWAECDataQuestionsFlow',
    inputSchema: AnswerWAECDataQuestionsInputSchema,
    outputSchema: AnswerWAECDataQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

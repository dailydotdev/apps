import { gql } from 'graphql-request';
import { gqlClient } from './common';

export interface GuessWhoQuizQAInput {
  question: string;
  answer: string;
}

export interface GuessWhoQuizNextQuestion {
  question: string;
  options: string[];
}

export interface GuessWhoQuizFinalPersona {
  name: string;
  description: string;
  tags: string[];
}

export interface GuessWhoQuizStepResult {
  nextQuestion: GuessWhoQuizNextQuestion | null;
  finalPersona: GuessWhoQuizFinalPersona | null;
}

export const GUESS_WHO_QUIZ_STEP_MUTATION = gql`
  mutation GuessWhoQuizStep($history: [GuessWhoQuizQAInput!]!) {
    guessWhoQuizStep(history: $history) {
      nextQuestion {
        question
        options
      }
      finalPersona {
        name
        description
        tags
      }
    }
  }
`;

export const requestGuessWhoQuizStep = async (
  history: GuessWhoQuizQAInput[],
): Promise<GuessWhoQuizStepResult> => {
  const res = await gqlClient.request<{
    guessWhoQuizStep: GuessWhoQuizStepResult;
  }>(GUESS_WHO_QUIZ_STEP_MUTATION, { history });
  return res.guessWhoQuizStep;
};

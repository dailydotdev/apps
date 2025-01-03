import { gql } from 'graphql-request';
import type { ColorName } from '../styles/colors';

export type PromptFlags = {
  icon?: string;
  color?: ColorName;
};

export type Prompt = {
  id: string;
  label: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  flags?: PromptFlags;
};

export enum PromptDisplay {
  TLDR = 'tldr',
  UpgradeToPlus = 'upgrade-to-plus',
  ActionableSteps = 'actionable-steps',
  ChallengeThis = 'challenge-this',
  CompareAlternatives = 'compare-alternatives',
  CustomPrompt = 'custom-prompt',
  ExtractCode = 'extract-code',
  PracticalExamples = 'practical-examples',
  RemoveFluff = 'remove-fluff',
  SimplifyIt = 'simplify-it',
  SkillsNeeded = 'skills-needed',
}

export const PROMPTS_QUERY = gql`
  query Prompts {
    prompts {
      id
      label
      description
      flags {
        icon
        color
      }
    }
  }
`;

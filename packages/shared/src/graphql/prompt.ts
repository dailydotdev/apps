import { gql } from 'graphql-request';
import type { ColorName } from '../styles/colors';

export type PromptFlags = {
  icon?: string;
  color?: ColorName;
};

export type Prompt = {
  id: string;
  label: string;
  prompt: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  flags?: PromptFlags;
};

export enum PromptDisplay {
  TLDR = 'tldr',
  UpgradeToPlus = 'upgrade-to-plus',
  SmartPrompt = 'smart-prompt',
  CustomPrompt = 'custom-prompt',
}

export const PROMPTS_QUERY = gql`
  query Prompts {
    prompts {
      id
      label
      description
      prompt
      flags {
        icon
        color
      }
    }
  }
`;

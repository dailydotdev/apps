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

import { gql } from 'graphql-request';

export type PromptFlags = {
  icon?: string;
  color?: string;
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

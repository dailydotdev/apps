import { gql } from 'graphql-request';

export interface PersonalAccessToken {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
}

export interface PersonalAccessTokenCreated extends PersonalAccessToken {
  token: string;
}

export interface PersonalAccessTokensData {
  personalAccessTokens: PersonalAccessToken[];
}

export interface CreatePersonalAccessTokenData {
  createPersonalAccessToken: PersonalAccessTokenCreated;
}

export interface CreatePersonalAccessTokenInput {
  name: string;
  expiresInDays?: number | null;
}

export interface RevokePersonalAccessTokenData {
  revokePersonalAccessToken: { _: boolean };
}

export const PERSONAL_ACCESS_TOKENS_QUERY = gql`
  query PersonalAccessTokens {
    personalAccessTokens {
      id
      name
      tokenPrefix
      createdAt
      expiresAt
      lastUsedAt
    }
  }
`;

export const CREATE_PERSONAL_ACCESS_TOKEN_MUTATION = gql`
  mutation CreatePersonalAccessToken($input: CreatePersonalAccessTokenInput!) {
    createPersonalAccessToken(input: $input) {
      id
      name
      token
      tokenPrefix
      createdAt
      expiresAt
    }
  }
`;

export const REVOKE_PERSONAL_ACCESS_TOKEN_MUTATION = gql`
  mutation RevokePersonalAccessToken($id: ID!) {
    revokePersonalAccessToken(id: $id) {
      _
    }
  }
`;

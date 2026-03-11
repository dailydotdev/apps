import { gql } from 'graphql-request';
import { gqlClient } from './common';

export type GitHubUserRepository = {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
};

export const USER_GITHUB_REPOSITORIES_QUERY = gql`
  query UserGithubRepositories($userId: ID!) {
    userGithubRepositories(userId: $userId) {
      id
      owner
      name
      fullName
      url
      description
      stars
      forks
      language
      updatedAt
    }
  }
`;

export const getUserGithubRepositories = async (
  userId: string,
): Promise<GitHubUserRepository[]> => {
  const result = await gqlClient.request<{
    userGithubRepositories: GitHubUserRepository[];
  }>(USER_GITHUB_REPOSITORIES_QUERY, { userId });
  return result.userGithubRepositories;
};

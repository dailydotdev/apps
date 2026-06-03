import { gql } from 'graphql-request';
import { gqlClient } from './common';

export type OnboardingTagsResult = {
  includeTags: string[];
};

export const GITHUB_PROFILE_TAGS_MUTATION = gql`
  mutation GitHubProfileTags {
    githubProfileTags {
      includeTags
    }
  }
`;

export const ONBOARDING_PROFILE_TAGS_MUTATION = gql`
  mutation OnboardingProfileTags($prompt: String!) {
    onboardingProfileTags(prompt: $prompt) {
      includeTags
    }
  }
`;

export const requestGitHubProfileTags = async (): Promise<string[]> => {
  const res = await gqlClient.request<{
    githubProfileTags: OnboardingTagsResult;
  }>(GITHUB_PROFILE_TAGS_MUTATION);
  return res.githubProfileTags.includeTags;
};

export const requestOnboardingProfileTags = async (
  prompt: string,
): Promise<string[]> => {
  const res = await gqlClient.request<{
    onboardingProfileTags: OnboardingTagsResult;
  }>(ONBOARDING_PROFILE_TAGS_MUTATION, { prompt });
  return res.onboardingProfileTags.includeTags;
};

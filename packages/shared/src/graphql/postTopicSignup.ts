import { gql } from 'graphql-request';
import type { Post } from './posts';
import { gqlBatchRequest } from './batch';
import { StaleTime } from '../lib/query';

export const POST_TOPIC_SIGNUP_PREVIEW_COUNT = 2;

export type PostTopicSignupPreview = Pick<
  Post,
  'id' | 'title' | 'commentsPermalink'
> & {
  source?: { name: string } | null;
};

export interface PostTopicSignupData {
  similarPosts: PostTopicSignupPreview[];
}

export const POST_TOPIC_SIGNUP_QUERY = gql`
  query PostTopicSignup($post: ID!, $tag: String!, $first: Int!) {
    similarPosts: randomSimilarPostsByTags(
      post: $post
      tags: [$tag]
      first: $first
    ) {
      id
      title
      commentsPermalink
      source {
        name
      }
    }
  }
`;

export const postTopicSignupQueryOptions = (postId: string, tag: string) => ({
  queryKey: ['postTopicSignup', postId, tag],
  queryFn: () =>
    gqlBatchRequest<PostTopicSignupData>(POST_TOPIC_SIGNUP_QUERY, {
      post: postId,
      tag,
      first: POST_TOPIC_SIGNUP_PREVIEW_COUNT,
    }),
  staleTime: StaleTime.OneHour,
});

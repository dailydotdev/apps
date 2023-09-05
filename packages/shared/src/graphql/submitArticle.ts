import { gql } from 'graphql-request';
import { Post } from './posts';

interface Submission {
  id: string;
  url: string;
  userId: string;
  createdAt: Date;
  status: string;
  reason: string;
}

export interface SubmitArticleResponse {
  result: 'succeed' | 'exists' | 'rejected';
  reason?: string;
  post?: Post;
  submission?: Submission;
}

export interface SubmissionAvailability {
  hasAccess: boolean;
  limit: number;
  todaySubmissionsCount: number;
}

export const SUBMIT_ARTICLE_MUTATION = gql`
  mutation SubmitArticle($url: String!) {
    submitArticle(url: $url) {
      result
      reason
      post {
        id
        title
        commentsPermalink
        image
        readTime
        numUpvotes
        permalink
        source {
          id
          image
        }
      }
      submission {
        id
        url
        userId
        createdAt
        status
        reason
      }
    }
  }
`;

export const SUBMISSION_AVAILABILITY_QUERY = gql`
  query SubmissionAvailability {
    submissionAvailability {
      hasAccess
      limit
      todaySubmissionsCount
    }
  }
`;

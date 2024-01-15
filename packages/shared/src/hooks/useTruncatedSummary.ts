import { Post } from '../graphql/posts';

export const useTruncatedSummary = (
  post: Post,
): { summary?: string; title: string } => {
  const title =
    post.title.length > 300 ? `${post.title.slice(0, 300)}...` : post.title;
  const maxSummaryLength = Math.max(0, 300 - post.title.length);
  const summary =
    post.summary && post.summary.length > maxSummaryLength
      ? `${post.summary.slice(0, maxSummaryLength)}...`
      : post.summary;

  return {
    title,
    summary,
  };
};

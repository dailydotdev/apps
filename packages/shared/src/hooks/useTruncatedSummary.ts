import { Post } from '../graphql/posts';

export const useTruncatedSummary = (
  post: Post,
  sanitizedSummary?: string,
): { summary?: string; title: string } => {
  const title =
    post.title?.length > 300 ? `${post.title.slice(0, 300)}...` : post.title;
  const maxSummaryLength = Math.max(0, 300 - post.title?.length || 0);
  const summary = sanitizedSummary || post.summary;
  const truncatedSummary =
    summary && summary.length > maxSummaryLength
      ? `${summary.slice(0, maxSummaryLength)}...`
      : summary;

  return {
    title,
    summary: truncatedSummary,
  };
};

export const useTruncatedSummary = (
  titleProp: string,
  sanitizedSummary?: string,
): { summary?: string; title: string } => {
  const title =
    titleProp?.length > 300 ? `${titleProp.slice(0, 300)}...` : titleProp;
  const maxSummaryLength = Math.max(0, 300 - titleProp?.length || 0);
  const summary = sanitizedSummary;
  const truncatedSummary =
    summary && summary.length > maxSummaryLength
      ? `${summary.slice(0, maxSummaryLength)}...`
      : summary;

  return {
    title,
    summary: truncatedSummary,
  };
};

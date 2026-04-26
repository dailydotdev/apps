export const HOT_DESCRIPTION_THRESHOLD = 30;

export const getTrendingDescription = (
  trending?: number,
): string | undefined => {
  if (!trending || trending <= 0) {
    return undefined;
  }
  if (trending >= HOT_DESCRIPTION_THRESHOLD) {
    return `${trending} devs read it last hour`;
  }
  return 'Trending now';
};

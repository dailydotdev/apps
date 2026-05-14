export type ExploreCategory = {
  id: string;
  label: string;
  path: string;
  tag?: string;
};

export const buildPersonalizedCategories = (
  tags: string[],
): ExploreCategory[] =>
  tags.map((tag) => ({
    id: tag,
    label: tag,
    path: `/explore/${tag}`,
    tag,
  }));

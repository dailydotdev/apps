import { webappUrl } from '../../lib/constants';

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
    path: `${webappUrl}explore/${tag}`,
    tag,
  }));

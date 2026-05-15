import type { FeedTagsListItem } from '../../graphql/feedTagsList';
import { webappUrl } from '../../lib/constants';

export type ExploreCategory = {
  id: string;
  label: string;
  path: string;
  tag?: string;
};

export const buildPersonalizedCategories = (
  tags: FeedTagsListItem[],
): ExploreCategory[] =>
  tags.map(({ value, label }) => ({
    id: value,
    label,
    path: `${webappUrl}explore/${value}`,
    tag: value,
  }));

import type { Edge } from '../../graphql/common';
import type { Feed } from '../../graphql/feed';
import { webappUrl } from '../../lib/constants';

export type ExploreCategory = {
  id: string;
  label: string;
  path: string;
  tag?: string;
};

// Feeds are rendered in the order the API returns them.
export const buildPersonalizedCategories = (
  edges: Edge<Feed>[],
): ExploreCategory[] =>
  edges.map(({ node: feed }) => ({
    id: feed.id,
    label: feed.flags?.name || `Feed ${feed.id}`,
    path: `${webappUrl}feeds/${feed.slug}`,
    tag: feed.id,
  }));

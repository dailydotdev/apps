import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryCharmNoPosts } from '../../../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../../../components/charm/CharmEmptyState';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadPostingState, isJoinedViewer } from '../../lib/viewer';
import { useSquadProducts } from '../../hooks/useSquadProducts';

const getEmptyCopy = (canPost: boolean, isJoined: boolean): string => {
  if (canPost) {
    return 'Share the first post and it shows up here for every member.';
  }

  if (isJoined) {
    return 'The team has not posted yet. You will hear when they do.';
  }

  return 'The team has not posted yet. Join to hear when they do.';
};

export const SquadEmptyFeed = (): ReactElement => {
  const { squad, viewer } = useSquadPageContext();
  const { canPost } = getSquadPostingState(squad, viewer);

  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmNoPosts}
      imageAlt="daily.dev charm waiting for the first post"
      title="Nothing posted yet"
      description={getEmptyCopy(canPost, isJoinedViewer(viewer))}
    />
  );
};

export const SquadSearchEmpty = ({
  query,
}: {
  query: string;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const { isEnabled, products } = useSquadProducts(squad);
  const hasProducts = isEnabled && products.length > 0;

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
      <span className="font-bold text-text-primary typo-callout">
        No posts match “{query}”
      </span>
      <span className="text-text-tertiary typo-footnote">
        {hasProducts
          ? 'Try a product name, a tag, or fewer words.'
          : 'Try a tag or fewer words.'}
      </span>
    </div>
  );
};

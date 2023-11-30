import React, { ReactElement, useContext, useMemo } from 'react';
import { Button } from '../buttons/Button';
import { PinIcon } from '../icons';
import { Squad } from '../../graphql/sources';
import { ActiveFeedContext, useActiveFeedContext } from '../../contexts';
import { useSquadActions } from '../../hooks';

interface SquadFeedHeadingProps {
  squad: Squad;
}

function SquadFeedHeading({ squad }: SquadFeedHeadingProps): ReactElement {
  const { items } = useActiveFeedContext();
  const { collapseSquadPinnedPosts, expandSquadPinnedPosts } = useSquadActions({
    squad,
  });
  const collapsePinnedPosts = squad?.currentMember?.flags?.collapsePinnedPosts;

  const onClick = async () => {
    return collapsePinnedPosts
      ? await expandSquadPinnedPosts(squad.id)
      : await collapseSquadPinnedPosts(squad.id);
  };

  const pinnedPostsCount = useMemo(
    () =>
      items.reduce((acc, item) => {
        if (item.type === 'post' && !!item.post.pinnedAt) {
          return acc + 1;
        }
        return acc;
      }, 0),
    [items],
  );

  return (
    <div className="flex flex-row flex-wrap gap-4 justify-end items-center pb-6 w-full">
      <span className="flex flex-row gap-3 pl-3 ml-auto border-l border-theme-divider-tertiary">
        <Button
          className="btn-tertiaryFloat"
          onClick={onClick}
          icon={<PinIcon />}
        >
          {collapsePinnedPosts
            ? `Show pinned posts (${pinnedPostsCount})`
            : 'Hide pinned posts'}
        </Button>
      </span>
    </div>
  );
}

export default SquadFeedHeading;

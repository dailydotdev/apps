import React, { ReactElement, useContext, useMemo } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { PinIcon } from '../icons';
import { Squad } from '../../graphql/sources';
import { ActiveFeedContext } from '../../contexts';
import { useSquadActions } from '../../hooks';

interface SquadFeedHeadingProps {
  squad: Squad;
}

function SquadFeedHeading({ squad }: SquadFeedHeadingProps): ReactElement {
  const { items } = useContext(ActiveFeedContext);
  const { collapseSquadPinnedPosts, expandSquadPinnedPosts } = useSquadActions({
    squad,
  });
  const collapsePinnedPosts = squad?.currentMember?.flags?.collapsePinnedPosts;
  const isSquadMember = !!squad.currentMember;

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
    <div className="flex w-full flex-row flex-wrap items-center justify-end gap-4 pb-6">
      <span className="ml-auto flex flex-row gap-3 border-l border-border-subtlest-tertiary pl-3">
        {isSquadMember && (
          <Button
            variant={ButtonVariant.Float}
            onClick={onClick}
            icon={<PinIcon />}
          >
            {collapsePinnedPosts
              ? `Show pinned posts (${pinnedPostsCount})`
              : 'Hide pinned posts'}
          </Button>
        )}
      </span>
    </div>
  );
}

export default SquadFeedHeading;

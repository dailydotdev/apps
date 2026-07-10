import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { PinIcon } from '../icons';
import type { Squad } from '../../graphql/sources';
import { ActiveFeedContext } from '../../contexts';
import { useSquadActions } from '../../hooks';

interface SquadFeedHeadingProps {
  squad: Squad;
  /** Optional search field rendered at the start of the heading row. */
  searchChildren?: ReactNode;
}

function SquadFeedHeading({
  squad,
  searchChildren,
}: SquadFeedHeadingProps): ReactElement {
  const { items } = useContext(ActiveFeedContext);
  const { collapseSquadPinnedPosts, expandSquadPinnedPosts } = useSquadActions({
    squad,
    membersQueryEnabled: false,
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
    <div className="flex w-full flex-row flex-wrap items-center justify-end gap-4 px-6 pb-6 laptop:px-0">
      {searchChildren && (
        <div className="min-w-[12rem] max-w-[20rem] flex-1">
          {searchChildren}
        </div>
      )}
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

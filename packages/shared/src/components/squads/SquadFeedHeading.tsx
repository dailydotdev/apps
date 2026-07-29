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
    const togglePinnedPosts = collapsePinnedPosts
      ? expandSquadPinnedPosts
      : collapseSquadPinnedPosts;

    if (!togglePinnedPosts || !squad.id) {
      throw new Error(
        'SquadFeedHeading: pinned posts toggle requires a squad id and mutation',
      );
    }

    return togglePinnedPosts(squad.id);
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
      {/* Mirrors the bookmarks CustomFeedHeader idiom: the search field fills
          the row and the action buttons sit directly after it, so there is no
          dead gap between the two. */}
      {searchChildren && (
        <div className="flex min-w-[12rem] flex-1 items-center">
          {searchChildren}
        </div>
      )}
      {isSquadMember && (
        <span
          className={
            searchChildren
              ? 'flex flex-row gap-3'
              : 'ml-auto flex flex-row gap-3 border-l border-border-subtlest-tertiary pl-3'
          }
        >
          <Button
            variant={ButtonVariant.Float}
            onClick={onClick}
            icon={<PinIcon />}
          >
            {collapsePinnedPosts
              ? `Show pinned posts (${pinnedPostsCount})`
              : 'Hide pinned posts'}
          </Button>
        </span>
      )}
    </div>
  );
}

export default SquadFeedHeading;

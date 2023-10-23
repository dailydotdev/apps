import React, { ReactElement, useContext, useMemo } from 'react';
import { Button } from '../buttons/Button';
import { PinIcon } from '../icons';
import { Squad } from '../../graphql/sources';
import { ActiveFeedContext } from '../../contexts';
import { useSquadActions } from '../../hooks';
import { LoggedUser } from '../../lib/user';

interface SquadFeedHeadingProps {
  squad: Squad;
  user: LoggedUser;
}

function SquadFeedHeading({
  squad,
  user,
}: SquadFeedHeadingProps): ReactElement {
  const { items } = useContext(ActiveFeedContext);
  const { collapseSquadPinnedPosts, expandSquadPinnedPosts } = useSquadActions({
    squad,
    user,
  });
  const { collapsePinnedPosts } = squad.currentMember.flags;
  const itemsCount = items.length;

  const onClick = async () => {
    return collapsePinnedPosts
      ? await expandSquadPinnedPosts(squad.id)
      : await collapseSquadPinnedPosts(squad.id);
  };

  const pinnedPostsCount = useMemo(() => {
    let countPinned = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type === 'post' && !!item.post.pinnedAt) {
        countPinned += 1;
      } else {
        break;
      }
    }

    return countPinned;
  }, [itemsCount]);

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

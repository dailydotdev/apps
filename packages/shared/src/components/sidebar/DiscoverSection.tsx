import React, { ReactElement, useMemo } from 'react';
import {
  DiscussIcon,
  EarthIcon,
  HashtagIcon,
  HotIcon,
  SquadIcon,
} from '../icons';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { checkIsExtension } from '../../lib/func';
import { webappUrl } from '../../lib/constants';
import { SharedFeedPage } from '../utilities';
import { OtherFeedPage } from '../../lib/query';

interface DiscoverSectionProps extends SectionCommonProps {
  isItemsButton?: boolean;
  enableSearch?: () => void;
  onNavTabClick?: (page: string) => unknown;
}

const locationPush = (path: string) => () =>
  window.location.assign(`${webappUrl}${path}`);

export function DiscoverSection({
  isItemsButton,
  onNavTabClick,
  enableSearch,
  ...defaultRenderSectionProps
}: DiscoverSectionProps): ReactElement {
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const hasCompletedCommentFeed =
    !isActionsFetched || checkHasCompleted(ActionType.CommentFeed);

  const discoverMenuItems: SidebarMenuItem[] = useMemo(() => {
    const pushToDiscussed = locationPush(SharedFeedPage.Discussed);
    const isExtension = checkIsExtension();
    const feeds = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <HotIcon secondary={active} />} />
      ),
      title: 'Explore',
      path: '/posts',
      action: () => onNavTabClick?.(OtherFeedPage.Explore),
    };

    const discussion = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
      ),
      title: 'Discussions',
      path: '/discussed',
      action: () => {
        completeAction(ActionType.CommentFeed);
        if (isExtension) {
          pushToDiscussed();
        }
      },
      ...(!hasCompletedCommentFeed && {
        rightIcon: () => (
          <span className="flex h-4 items-center rounded-6 bg-brand-default px-1 font-bold text-white typo-caption2">
            NEW
          </span>
        ),
      }),
    };

    return [
      feeds,
      discussion,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: '/tags',
        action: isExtension ? locationPush('/tags') : undefined,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: '/sources',
        action: isExtension ? locationPush('/sources') : undefined,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SquadIcon secondary={active} />} />
        ),
        title: 'Leaderboard',
        path: '/users',
        action: isExtension ? locationPush('/users') : undefined,
      },
    ];
  }, [completeAction, hasCompletedCommentFeed, onNavTabClick]);

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Discover"
      items={discoverMenuItems}
      isItemsButton={isItemsButton}
    />
  );
}

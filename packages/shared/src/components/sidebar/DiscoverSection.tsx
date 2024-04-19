import React, { ReactElement } from 'react';
import { DiscussIcon, HotIcon, SearchIcon, UpvoteIcon } from '../icons';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';

interface DiscoverSectionProps extends SectionCommonProps {
  isItemsButton?: boolean;
  enableSearch?: () => void;
  onNavTabClick?: (page: string) => unknown;
}

export function DiscoverSection({
  isItemsButton,
  onNavTabClick,
  enableSearch,
  ...defaultRenderSectionProps
}: DiscoverSectionProps): ReactElement {
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const hasCompletedCommentFeed =
    !isActionsFetched || checkHasCompleted(ActionType.CommentFeed);
  const discoverMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
      ),
      title: 'Discussions',
      path: '/discussed',
      action: () => {
        completeAction(ActionType.CommentFeed);
        onNavTabClick?.('discussed');
      },
      ...(!hasCompletedCommentFeed && {
        rightIcon: () => (
          <span className="flex h-4 items-center rounded-6 bg-brand-default px-1 font-bold text-white typo-caption2">
            NEW
          </span>
        ),
      }),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <HotIcon secondary={active} />} />
      ),
      title: 'Popular',
      path: '/popular',
      action: () => onNavTabClick?.('popular'),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <UpvoteIcon secondary={active} />} />
      ),
      title: 'Most upvoted',
      path: '/upvoted',
      action: () => onNavTabClick?.('upvoted'),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SearchIcon secondary={active} />} />
      ),
      title: 'Search',
      hideOnMobile: true,
      path: '/search',
      action: enableSearch,
      showActiveAsH1: true,
    },
  ];

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Discover"
      items={discoverMenuItems}
      isItemsButton={isItemsButton}
    />
  );
}

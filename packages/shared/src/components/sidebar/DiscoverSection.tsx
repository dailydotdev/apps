import React, { ReactElement } from 'react';
import DiscussIcon from '../icons/Discuss';
import HotIcon from '../icons/Hot';
import SearchIcon from '../icons/Search';
import UpvoteIcon from '../icons/Upvote';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import SourceIcon from '../icons/Source';

interface DiscoverSectionProps extends SectionCommonProps {
  isItemsButton?: boolean;
  onNavTabClick?: (page: string) => unknown;
}

export function DiscoverSection({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: DiscoverSectionProps): ReactElement {
  const discoverMenuItems: SidebarMenuItem[] = [
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
        <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
      ),
      title: 'Best discussions',
      path: '/discussed',
      action: () => onNavTabClick?.('discussed'),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SourceIcon secondary={active} />} />
      ),
      title: 'Squads',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}squads`,
      isForcedLink: true,
      rightIcon: () => (
        <span className="font-bold typo-caption1 text-theme-label-quaternary">
          beta
        </span>
      ),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SearchIcon secondary={active} />} />
      ),
      title: 'Search',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}search`,
      isForcedLink: true,
      hideOnMobile: true,
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

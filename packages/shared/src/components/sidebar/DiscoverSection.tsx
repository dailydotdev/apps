import React, { ReactElement } from 'react';
import { FeaturesData } from '../../contexts/FeaturesContext';
import DiscussIcon from '../icons/Discuss';
import HotIcon from '../icons/Hot';
import SearchIcon from '../icons/Search';
import UpvoteIcon from '../icons/Upvote';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';

interface DiscoverSectionProps
  extends SectionCommonProps,
    Pick<FeaturesData, 'popularFeedCopy'> {
  isItemsButton?: boolean;
  enableSearch?: () => unknown;
  onNavTabClick?: (page: string) => unknown;
}

export function DiscoverSection({
  isItemsButton,
  popularFeedCopy,
  enableSearch,
  onNavTabClick,
  ...defaultRenderSectionProps
}: DiscoverSectionProps): ReactElement {
  const discoverMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <HotIcon secondary={active} />} />
      ),
      title: popularFeedCopy,
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
        <ListIcon Icon={() => <SearchIcon secondary={active} />} />
      ),
      title: 'Search',
      path: '/search',
      action: enableSearch,
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

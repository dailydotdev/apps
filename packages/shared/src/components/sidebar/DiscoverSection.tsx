import React, { ReactElement } from 'react';
import { DiscussIcon, HotIcon, SearchIcon, UpvoteIcon } from '../icons';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';

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
  const searchValue = useFeature(feature.search);
  const isControlSearch = searchValue === SearchExperiment.Control;
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
        <ListIcon Icon={() => <SearchIcon secondary={active} />} />
      ),
      title: isControlSearch ? 'Search' : 'Post finder',
      hideOnMobile: isControlSearch,
      path: isControlSearch ? '/search' : '/posts/finder',
      action: enableSearch,
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

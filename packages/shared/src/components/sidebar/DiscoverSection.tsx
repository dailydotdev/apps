import React, { ReactElement, useCallback, useMemo } from 'react';
import {
  DiscussIcon,
  EarthIcon,
  HashtagIcon,
  HotIcon,
  SearchIcon,
  UpvoteIcon,
} from '../icons';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SeoSidebarExperiment } from '../../lib/featureValues';
import { checkIsExtension } from '../../lib/func';
import { webappUrl } from '../../lib/constants';

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
  const seoSidebar = useFeature(feature.seoSidebar);
  const isV1Sidebar = seoSidebar === SeoSidebarExperiment.V1;
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const hasCompletedCommentFeed =
    !isActionsFetched || checkHasCompleted(ActionType.CommentFeed);
  const locationPush = useCallback((path: string) => {
    const isExtension = checkIsExtension();

    if (!isExtension) {
      return null;
    }

    return window.location.assign(`${webappUrl}${path}`);
    // router is unstable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discoverMenuItems: SidebarMenuItem[] = useMemo(() => {
    const feeds = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <HotIcon secondary={active} />} />
      ),
      title: isV1Sidebar ? 'Explore' : 'Popular',
      path: isV1Sidebar ? '/explore' : '/popular',
      action: () => onNavTabClick?.(isV1Sidebar ? 'explore' : 'popular'),
    };

    const discussion = {
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
    };

    if (!isV1Sidebar) {
      return [
        discussion,
        feeds,
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
    }

    return [
      feeds,
      discussion,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: '/tags',
        action: () => locationPush('/tags'),
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: '/sources',
        action: () => locationPush('/sources'),
      },
    ];
  }, [
    completeAction,
    enableSearch,
    hasCompletedCommentFeed,
    isV1Sidebar,
    locationPush,
    onNavTabClick,
  ]);

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Discover"
      items={discoverMenuItems}
      isItemsButton={isItemsButton}
    />
  );
}

import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Section } from '../Section';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import {
  DevPlusIcon,
  EyeIcon,
  HomeIcon,
  HotIcon,
  MagicIcon,
  SquadIcon,
  MegaphoneIcon,
  YearInReviewIcon,
} from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { OtherFeedPage } from '../../../lib/query';
import type { SidebarSectionProps } from './common';
import { plusUrl, webappUrl } from '../../../lib/constants';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';
import { SharedFeedPage } from '../../utilities';
import { isExtension } from '../../../lib/func';
import { useConditionalFeature } from '../../../hooks';
import {
  featurePlusApiLanding,
  featureYearInReview,
} from '../../../lib/featureManagement';

export const MainSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const isPlus = user?.isPlus;
  const { value: isApiLanding } = useConditionalFeature({
    feature: featurePlusApiLanding,
    shouldEvaluate: !isPlus,
  });
  const ctaCopy = isApiLanding
    ? { full: 'Get API Access', short: 'API access' }
    : { full: 'Level Up with Plus', short: 'Upgrade' };
  const { value: showYearInReview } = useConditionalFeature({
    feature: featureYearInReview,
    shouldEvaluate: isLoggedIn,
  });
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    // this path can be opened on extension so it purposly
    // is not using webappUrl so it gets selected
    let myFeedPath = isCustomDefaultFeed ? '/my-feed' : '/';

    if (isExtension) {
      myFeedPath = '/my-feed';
    }

    const myFeed = isLoggedIn
      ? {
          title: 'For You',
          path: myFeedPath,
          action: () =>
            onNavTabClick?.(isCustomDefaultFeed ? SharedFeedPage.MyFeed : '/'),
          icon: (active: boolean) => (
            <ListIcon Icon={() => <MagicIcon secondary={active} />} />
          ),
        }
      : {
          title: 'Home',
          path: '/',
          action: () => onNavTabClick?.('/'),
          icon: (active: boolean) => (
            <ListIcon Icon={() => <HomeIcon secondary={active} />} />
          ),
        };

    const plusButton = !isPlus
      ? {
          icon: (active: boolean) => (
            <ListIcon Icon={() => <DevPlusIcon secondary={active} />} />
          ),
          title: ctaCopy.full,
          path: plusUrl,
          isForcedLink: true,
          requiresLogin: true,
          color: isApiLanding
            ? 'text-action-plus-default'
            : 'text-accent-avocado-default',
          itemClassName: isApiLanding
            ? 'bg-action-plus-float/50 hover:bg-action-plus-float'
            : 'bg-action-upvote-float/50 hover:bg-action-upvote-float',
          disableDefaultBackground: true,
        }
      : undefined;

    const yearInReview = showYearInReview
      ? {
          icon: () => <ListIcon Icon={() => <YearInReviewIcon />} />,
          title: 'Your 2025 in Review',
          titleClassName:
            'text-transparent bg-clip-text bg-gradient-to-b from-accent-lettuce-default to-accent-cabbage-default font-bold',
          path: `${webappUrl}log`,
          isForcedLink: true,
        }
      : undefined;

    return (
      [
        myFeed,
        {
          title: 'Following',
          // this path can be opened on extension so it purposly
          // is not using webappUrl so it gets selected
          path: '/following',
          action: () => onNavTabClick?.(OtherFeedPage.Following),
          requiresLogin: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <SquadIcon secondary={active} />} />
          ),
        },
        {
          icon: (active: boolean) => (
            <ListIcon Icon={() => <HotIcon secondary={active} />} />
          ),
          title: 'Explore',
          path: '/posts',
          action: () => onNavTabClick?.(OtherFeedPage.Explore),
        },
        {
          icon: (active: boolean) => (
            <ListIcon Icon={() => <EyeIcon secondary={active} />} />
          ),
          title: 'History',
          path: `${webappUrl}history`,
          isForcedLink: true,
          requiresLogin: true,
        },
        {
          icon: (active: boolean) => (
            <ListIcon Icon={() => <MegaphoneIcon secondary={active} />} />
          ),
          title: 'Happening Now',
          path: `${webappUrl}highlights`,
          isForcedLink: true,
          requiresLogin: true,
        },
        yearInReview,
        plusButton,
      ] as (SidebarMenuItem | undefined)[]
    ).filter((item): item is SidebarMenuItem => !!item);
  }, [
    ctaCopy.full,
    isApiLanding,
    isCustomDefaultFeed,
    isLoggedIn,
    isPlus,
    onNavTabClick,
    showYearInReview,
  ]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      className="!mt-0"
    />
  );
};

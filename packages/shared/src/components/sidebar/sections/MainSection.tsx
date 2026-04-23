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
  JoystickIcon,
  SquadIcon,
  MegaphoneIcon,
  YearInReviewIcon,
} from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
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
  questsFeature,
} from '../../../lib/featureManagement';
import { useQuestDashboard } from '../../../hooks/useQuestDashboard';
import { Typography, TypographyColor } from '../../typography/Typography';

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
  const { value: showGameCenter } = useConditionalFeature({
    feature: questsFeature,
    shouldEvaluate: isLoggedIn,
  });
  const { data: questDashboard } = useQuestDashboard();
  const claimableMilestoneCount = useMemo(
    () =>
      questDashboard?.milestone?.filter((quest) => quest.claimable).length ?? 0,
    [questDashboard?.milestone],
  );

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
          icon: () => (
            <ProfilePicture size={ProfileImageSize.XSmall} user={user!} />
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

    const gameCenter = showGameCenter
      ? {
          icon: (active: boolean) => (
            <ListIcon Icon={() => <JoystickIcon secondary={active} />} />
          ),
          title: 'Game Center',
          path: `${webappUrl}game-center`,
          isForcedLink: true,
          requiresLogin: true,
          ...(claimableMilestoneCount > 0 && {
            rightIcon: () => (
              <Typography
                color={TypographyColor.Secondary}
                bold
                className="rounded-6 bg-background-subtle px-1.5"
              >
                {claimableMilestoneCount}
              </Typography>
            ),
          }),
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
        gameCenter,
        yearInReview,
        plusButton,
      ] as (SidebarMenuItem | undefined)[]
    ).filter((item): item is SidebarMenuItem => !!item);
  }, [
    claimableMilestoneCount,
    ctaCopy.full,
    isApiLanding,
    isCustomDefaultFeed,
    isLoggedIn,
    isPlus,
    onNavTabClick,
    showGameCenter,
    showYearInReview,
    user,
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

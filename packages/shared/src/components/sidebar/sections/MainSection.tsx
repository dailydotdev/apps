import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Section } from '../Section';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DevPlusIcon, EyeIcon, HotIcon, SquadIcon } from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { OtherFeedPage } from '../../../lib/query';
import type { SidebarSectionProps } from './common';
import { plusUrl, webappUrl } from '../../../lib/constants';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';
import { SharedFeedPage } from '../../utilities';
import { isExtension } from '../../../lib/func';
import { useConditionalFeature } from '../../../hooks';
import { featurePlusCtaCopy } from '../../../lib/featureManagement';

export const MainSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const isPlus = user?.isPlus;
  const { value: ctaCopy } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
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
          icon: () => (
            <ProfilePicture size={ProfileImageSize.XSmall} user={user} />
          ),
        }
      : undefined;

    const plusButton = !isPlus
      ? {
          icon: (active: boolean) => (
            <ListIcon Icon={() => <DevPlusIcon secondary={active} />} />
          ),
          title: ctaCopy.full,
          path: plusUrl,
          isForcedLink: true,
          requiresLogin: true,
          color: 'text-accent-avocado-default !bg-action-upvote-float mb-4',
        }
      : undefined;

    return [
      plusButton,
      myFeed,
      {
        title: 'Following',
        // this path can be opened on extension so it purposly
        // is not using webappUrl so it gets selected
        path: '/following',
        action: () => onNavTabClick?.(OtherFeedPage.Following),
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
    ].filter(Boolean);
  }, [ctaCopy, isCustomDefaultFeed, isLoggedIn, isPlus, onNavTabClick, user]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      className="!mt-0"
    />
  );
};

import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Section } from '../Section';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { EyeIcon, HomeIcon, HotIcon, SquadIcon } from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { OtherFeedPage } from '../../../lib/query';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';
import { SharedFeedPage } from '../../utilities';
import { isExtension } from '../../../lib/func';
import { useFeature } from '../../GrowthBookProvider';
import { featureCustomFeedPlacement } from '../../../lib/featureManagement';

export const MainSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const customFeedPlacement = useFeature(featureCustomFeedPlacement);

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    // this path can be opened on extension so it purposly
    // is not using webappUrl so it gets selected
    let myFeedPath = isCustomDefaultFeed ? '/my-feed' : '/';

    if (isExtension && !customFeedPlacement) {
      myFeedPath = '/my-feed';
    }

    if (isCustomDefaultFeed && customFeedPlacement) {
      myFeedPath = `/feeds/${defaultFeedId}`;
    }

    const myFeed = isLoggedIn
      ? {
          title: customFeedPlacement ? 'Home' : 'My feed',
          path: myFeedPath,
          action: () =>
            onNavTabClick?.(isCustomDefaultFeed ? SharedFeedPage.MyFeed : '/'),
          icon: (active: boolean) =>
            customFeedPlacement ? (
              <HomeIcon secondary={active} />
            ) : (
              <ProfilePicture size={ProfileImageSize.XSmall} user={user} />
            ),
        }
      : undefined;

    return [
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
  }, [
    isLoggedIn,
    user,
    isCustomDefaultFeed,
    onNavTabClick,
    customFeedPlacement,
    defaultFeedId,
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

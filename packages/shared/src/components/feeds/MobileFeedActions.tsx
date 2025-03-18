import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { Divider, SharedFeedPage } from '../utilities';
import MyFeedHeading from '../filters/MyFeedHeading';
import { useReadingStreak } from '../../hooks/streaks';
import { ButtonIconPosition } from '../buttons/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import HeaderLogo from '../layout/HeaderLogo';
import { LogoPosition } from '../Logo';
import { webappUrl } from '../../lib/constants';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { getFeedName } from '../../lib/feed';

export function MobileFeedActions(): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();

  return (
    <div className="flex flex-row justify-between px-4 py-1">
      <HeaderLogo
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
      />
      <span className="flex flex-row items-center gap-2">
        {isStreaksEnabled && (
          <ReadingStreakButton
            isLoading={isLoading}
            streak={streak}
            compact
            iconPosition={ButtonIconPosition.Right}
          />
        )}
        <Divider className="bg-border-subtlest-tertiary" vertical />
        <MyFeedHeading
          onOpenFeedFilters={() => {
            if (isCustomDefaultFeed && router.pathname === '/') {
              router.push(`${webappUrl}feeds/${defaultFeedId}/edit`);
            } else {
              const feedName = getFeedName(router.pathname);

              router.push(
                `${webappUrl}feeds/${
                  feedName === SharedFeedPage.Custom
                    ? router.query.slugOrId
                    : user.id
                }/edit`,
              );
            }
          }}
        />
        {user && (
          <Link href={`${webappUrl}/${user.username}`} passHref>
            <a>
              <ProfilePicture
                user={user}
                size={ProfileImageSize.Medium}
                nativeLazyLoading
              />
            </a>
          </Link>
        )}
      </span>
    </div>
  );
}

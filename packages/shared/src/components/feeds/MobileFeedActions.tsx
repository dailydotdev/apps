import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';

import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { ButtonIconPosition } from '../buttons/common';
import MyFeedHeading from '../filters/MyFeedHeading';
import Logo, { LogoPosition } from '../Logo';
import { LazyModal } from '../modals/common/types';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { Divider } from '../utilities';

export function MobileFeedActions(): ReactElement {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const featureTheme = useFeatureTheme();

  return (
    <div className="flex flex-row justify-between px-4 py-1">
      <Logo
        showGreeting={false}
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
        featureTheme={featureTheme}
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
          onOpenFeedFilters={() =>
            openModal({
              type: LazyModal.FeedFilters,
              persistOnRouteChange: true,
            })
          }
        />
        {user && (
          <Link href={user.permalink} passHref>
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

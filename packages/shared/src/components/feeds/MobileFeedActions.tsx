import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo, { LogoPosition } from '../Logo';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { Divider } from '../utilities';
import MyFeedHeading from '../filters/MyFeedHeading';
import { LazyModal } from '../modals/common/types';
import NotificationsBell from '../notifications/NotificationsBell';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useReadingStreak } from '../../hooks/streaks';
import { ButtonIconPosition } from '../buttons/common';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { HypeButton } from '../referral';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';

export function MobileFeedActions(): ReactElement {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const featureTheme = useFeatureTheme();
  const hypeCampaign = useFeature(feature.hypeCampaign);
  const notificationsNavBar = useFeature(feature.notificationsNavBar);

  return (
    <div className="flex flex-row justify-between px-4 py-1">
      <Logo
        showGreeting={false}
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
        featureTheme={featureTheme}
      />
      {hypeCampaign && <HypeButton />}
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
        {notificationsNavBar ? (
          <Link href={user.permalink} passHref>
            <a>
              <ProfilePicture
                user={user}
                size={ProfileImageSize.Medium}
                nativeLazyLoading
              />
            </a>
          </Link>
        ) : (
          <NotificationsBell compact />
        )}
      </span>
    </div>
  );
}

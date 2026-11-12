import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import type { ProfileSectionItemProps } from '../ProfileSectionItem';
import {
  AppleIcon,
  DocsIcon,
  FeedbackIcon,
  MegaphoneIcon,
  TerminalIcon,
} from '../../icons';
import {
  businessWebsiteUrl,
  docs,
  feedback,
  webappUrl,
} from '../../../lib/constants';
import { iOSSupportsReview, openIOSWriteReview } from '../../../lib/ios';
import { useFeature } from '../../GrowthBookProvider';
import { featureAppStoreReview } from '../../../lib/featureManagement';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

export const rateAppTitle = 'Show daily.dev some love ❤️';

export const ResourceSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const isReviewEnabled = useFeature(featureAppStoreReview);
  // The bridge is only known on the client, so read it after mount.
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    setCanReview(iOSSupportsReview());
  }, []);

  // Apple's advice for a permanent button: never request the pop-up from a
  // tap, since it may show nothing. The row opens the App Store's
  // write-a-review screen instead, which never spends the yearly prompts.
  const rateApp: ProfileSectionItemProps[] =
    canReview && isReviewEnabled
      ? [
          {
            title: rateAppTitle,
            icon: AppleIcon,
            onClick: () => {
              logEvent({
                event_name: LogEvent.Click,
                target_type: TargetType.AppStoreReview,
                target_id: 'profile_menu',
              });
              openIOSWriteReview();
            },
          },
        ]
      : [];

  return (
    <ProfileSection
      items={[
        {
          title: 'Changelog',
          icon: TerminalIcon,
          href: `${webappUrl}sources/daily_updates`,
        },
        ...rateApp,
        {
          title: 'Advertise',
          icon: MegaphoneIcon,
          href: businessWebsiteUrl,
          external: true,
        },
        {
          title: 'Docs',
          icon: DocsIcon,
          href: docs,
          external: true,
        },
        {
          title: 'Support',
          icon: FeedbackIcon,
          href: feedback,
          external: true,
        },
      ]}
    />
  );
};

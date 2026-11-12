import React from 'react';
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
import { rateAppTitle, useRateAppRow } from '../../../hooks/useRateAppRow';

export { rateAppTitle };

export const ResourceSection = (): ReactElement => {
  // Only reachable at laptop width, so inside the iOS app this is an iPad;
  // iPhones get the same row on the phone shell's You page.
  const rateApp = useRateAppRow('profile_menu');
  const rateAppItems: ProfileSectionItemProps[] = rateApp.isVisible
    ? [{ title: rateAppTitle, icon: AppleIcon, onClick: rateApp.onClick }]
    : [];

  return (
    <ProfileSection
      items={[
        {
          title: 'Changelog',
          icon: TerminalIcon,
          href: `${webappUrl}sources/daily_updates`,
        },
        ...rateAppItems,
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

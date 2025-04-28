import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import {
  DocsIcon,
  FeedbackIcon,
  MegaphoneIcon,
  PhoneIcon,
  ReputationLightningIcon,
  TerminalIcon,
} from '../../icons';
import {
  appsUrl,
  businessWebsiteUrl,
  docs,
  feedback,
  reputation,
  webappUrl,
} from '../../../lib/constants';

export const ResourceSection = (): ReactElement => {
  return (
    <ProfileSection
      items={[
        {
          title: 'Changelog',
          icon: TerminalIcon,
          href: `${webappUrl}sources/daily_updates`,
        },
        {
          title: 'Reputation',
          icon: ReputationLightningIcon,
          href: reputation,
          external: true,
        },
        {
          title: 'Advertise',
          icon: MegaphoneIcon,
          href: businessWebsiteUrl,
          external: true,
        },
        {
          title: 'Apps',
          icon: PhoneIcon,
          href: appsUrl,
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

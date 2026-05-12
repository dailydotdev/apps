import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import {
  DocsIcon,
  FeedbackIcon,
  MegaphoneIcon,
  PhoneIcon,
  PrivacyIcon,
  ReputationLightningIcon,
} from '../../icons';
import {
  appsUrl,
  businessWebsiteUrl,
  docs,
  reputation,
  settingsUrl,
} from '../../../lib/constants';

export const ResourceSection = (): ReactElement => {
  return (
    <ProfileSection
      title="Help center"
      items={[
        {
          title: 'Your Feedback',
          icon: FeedbackIcon,
          href: `${settingsUrl}/feedback`,
        },
        {
          title: 'Privacy',
          icon: PrivacyIcon,
          href: `${settingsUrl}/privacy`,
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
      ]}
    />
  );
};

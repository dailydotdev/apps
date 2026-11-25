import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaPopoverSmall } from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaPopoverSmall';
import { settingsUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Nav } from '@dailydotdev/shared/src/components/sidebar/common';
import { SettingsPanelSection } from '@dailydotdev/shared/src/components/sidebar/sections/SettingsPanelSection';
import SettingsLayout from '../../../webapp/components/layouts/SettingsLayout';
import ProfileIndex from '../../../webapp/components/layouts/SettingsLayout/Profile';
import { Providers } from './providers';

// What members see today, from the production components. The popover gets
// the live `verify-work-email` marketing_cta row, word for word.

/** The live row behind Customer.io campaign 46. */
export const verifyWorkEmailCta: MarketingCta = {
  campaignId: 'verify-work-email',
  variant: MarketingCtaVariant.PopoverSmall,
  createdAt: new Date('2025-05-28T13:43:53Z'),
  flags: {
    image:
      'https://media.daily.dev/image/upload/s--t5oyEhRs--/f_auto/v1728979615/public/Verified%20work%20email',
    title: 'Get verified for free',
    ctaUrl: 'https://app.daily.dev/settings/profile',
    ctaText: 'Get my badge',
    tagText: 'Verification',
    tagColor: 'avocado',
    description:
      'Claim your free verified badge to show where you work. It’s fast, easy, and makes your profile pop.',
  },
} as MarketingCta;

export const ProductionPopover = (): ReactElement => (
  <Providers>
    <MarketingCtaPopoverSmall marketingCta={verifyWorkEmailCta} />
  </Providers>
);

/**
 * A settings page on a laptop: the sidebar's settings panel (Back to app over
 * SettingsPanelSection, as SidebarDesktopV2 shows it on settings pages) beside
 * MainLayout's floating card, holding SettingsLayout and the page. The frame's
 * classes are copied from those two.
 */
export const SettingsFrame = ({
  path,
  children,
}: {
  /** The page's path under settings, e.g. `/profile`. */
  path: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]">
    {/* Below laptop the settings page shows its own menu instead. */}
    <aside className="hidden w-[20rem] shrink-0 flex-col laptop:flex">
      <div className="pl-5 pr-3 pt-6">
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          icon={<MoveToIcon size={IconSize.Size16} className="-scale-x-100" />}
          className="-ml-1"
        >
          Back to app
        </Button>
      </div>
      <Nav className="mt-1 !pt-0">
        <SettingsPanelSection
          isItemsButton={false}
          sidebarExpanded
          shouldShowLabel
          // Compared host-free, as isSidebarItemActive does with the links.
          activePage={`${settingsUrl}${path}`.replace(/^https?:\/\/[^/]+/, '')}
          isV2Panel
        />
      </Nav>
    </aside>
    <div className="my-3 ml-1 mr-3 flex min-w-0 flex-1 flex-col">
      <div className="relative flex flex-1 flex-col overflow-clip rounded-24 border border-border-subtlest-quaternary bg-background-default p-0.5">
        <SettingsLayout>{children}</SettingsLayout>
      </div>
    </div>
  </div>
);

/** `/settings/profile`, where "Get my badge" goes. */
export const ProductionLanding = (): ReactElement => (
  <Providers>
    <SettingsFrame path="/profile">
      <ProfileIndex />
    </SettingsFrame>
  </Providers>
);

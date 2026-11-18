import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  ResponsivePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import TabList from '@dailydotdev/shared/src/components/tabs/TabList';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  boostManagerUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { useCanPurchaseCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import ProtectedPage from '../ProtectedPage';

export enum AnalyticsTab {
  Content = 'Content',
  Reputation = 'Reputation',
  Boost = 'Boost',
}

const tabUrls: Record<AnalyticsTab, string> = {
  [AnalyticsTab.Content]: `${webappUrl}analytics`,
  [AnalyticsTab.Reputation]: `${webappUrl}analytics/reputation`,
  [AnalyticsTab.Boost]: boostManagerUrl,
};

interface AnalyticsPageShellProps {
  activeTab: AnalyticsTab;
  /** Links for the tab, at the end of the header */
  actions?: ReactNode;
  /** Room for a wide table */
  isWide?: boolean;
  children: ReactNode;
}

export const AnalyticsPageShell = ({
  activeTab,
  actions,
  isWide = false,
  children,
}: AnalyticsPageShellProps): ReactElement => {
  const router = useRouter();
  const isLaptopLayout = useLaptopLayout();
  const isPhone = useIsPhone();
  const canPurchaseCores = useCanPurchaseCores();
  // Boosts are paid in Cores, so the tab comes with them
  const tabs = Object.values(AnalyticsTab)
    .filter(
      (label) =>
        label !== AnalyticsTab.Boost ||
        canPurchaseCores ||
        activeTab === AnalyticsTab.Boost,
    )
    .map((label) => ({ label, url: tabUrls[label] }));

  // On laptop the tabs are the page header, like the Explore, Tags, Squads
  // and notification settings headers: the active tab names the page, and
  // `!py-0` lets each item's underline sit on the header's bottom border.
  const headerTabs = (
    <SquadDirectoryNavbar
      aria-label="Analytics sections"
      className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
    >
      {tabs.map(({ label, url }) => (
        <SquadDirectoryNavbarItem
          key={label}
          buttonSize={ButtonSize.Small}
          isActive={label === activeTab}
          label={label}
          path={url}
          ariaLabel={`Show ${label.toLowerCase()} analytics`}
        />
      ))}
    </SquadDirectoryNavbar>
  );

  return (
    <ProtectedPage>
      {isLaptopLayout && (
        <PageHeader title={headerTabs} className="!py-0">
          {actions}
        </PageHeader>
      )}
      {isPhone && <ShellPage title="Analytics" />}
      <div
        className={classNames(
          'mx-auto w-full',
          isWide ? 'max-w-[64rem]' : 'max-w-[48rem]',
        )}
      >
        {!isLaptopLayout && !isPhone && (
          <LayoutHeader
            className={classNames(
              '!mb-0 hidden gap-2 border-b px-4 tablet:flex',
              pageBorders,
            )}
          >
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
              className="flex-1"
            >
              Analytics
            </Typography>
            {actions}
          </LayoutHeader>
        )}
        {!isLaptopLayout && (
          <nav
            aria-label="Analytics sections"
            className="border-b border-border-subtlest-tertiary px-2 tablet:px-4"
          >
            <TabList<AnalyticsTab>
              items={tabs}
              active={activeTab}
              tag="a"
              onClick={(label) => router.push(tabUrls[label])}
            />
          </nav>
        )}
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pt-4 tablet:pt-6">
          {children}
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
};

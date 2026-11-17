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
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import ProtectedPage from '../ProtectedPage';

export enum AnalyticsTab {
  Content = 'Content',
  Reputation = 'Reputation',
}

const tabUrls: Record<AnalyticsTab, string> = {
  [AnalyticsTab.Content]: `${webappUrl}analytics`,
  [AnalyticsTab.Reputation]: `${webappUrl}analytics/reputation`,
};

const tabs = Object.values(AnalyticsTab).map((label) => ({
  label,
  url: tabUrls[label],
}));

interface AnalyticsPageShellProps {
  activeTab: AnalyticsTab;
  children: ReactNode;
}

export const AnalyticsPageShell = ({
  activeTab,
  children,
}: AnalyticsPageShellProps): ReactElement => {
  const router = useRouter();
  const isLaptopLayout = useLaptopLayout();
  const isPhone = useIsPhone();

  return (
    <ProtectedPage>
      {isLaptopLayout && <PageHeader title="Analytics" />}
      {isPhone && <ShellPage title="Analytics" />}
      <div className="mx-auto w-full max-w-[48rem]">
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
          </LayoutHeader>
        )}
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
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pt-4 tablet:pt-6">
          {children}
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
};

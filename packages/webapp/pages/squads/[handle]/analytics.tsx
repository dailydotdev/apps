import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { addDays, subDays } from 'date-fns';
import {
  LayoutHeader,
  PageHeaderTitle,
} from '@dailydotdev/shared/src/components/layout/common';
import {
  Divider,
  pageBorders,
  ResponsivePageContainer,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  EyeIcon,
  ClickIcon,
  BookmarkIcon,
  DiscussIcon,
  MedalBadgeIcon,
  MergeIcon,
  ShareIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { AnalyticsNumberList } from '@dailydotdev/shared/src/components/analytics/common';
import { AnalyticsNumbersList } from '@dailydotdev/shared/src/components/analytics/AnalyticsNumbersList';
import { CombinedImpressionsChart } from '@dailydotdev/shared/src/components/analytics/CombinedImpressionsChart';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSquad } from '@dailydotdev/shared/src/hooks/squads/useSquad';
import {
  squadAnalyticsHistoryQueryOptions,
  squadAnalyticsQueryOptions,
  verifyPermission,
} from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
} from '@dailydotdev/shared/src/lib/timezones';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

const SectionContainer = classed('div', 'flex flex-col gap-4');
const dividerClassName = 'bg-border-subtlest-tertiary';
const HISTORY_LIMIT = 45;

type ImpressionNode = {
  name: string;
  value: number;
  isBoosted: boolean;
};

const SectionHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      type={TypographyType.Body}
      bold
      tag={TypographyTag.H2}
      color={TypographyColor.Primary}
    >
      {children}
    </Typography>
  );
};

const SquadAnalyticsPage = (): ReactElement => {
  const router = useRouter();
  const routeHandle = router.query?.handle;
  const handle = Array.isArray(routeHandle) ? routeHandle[0] : routeHandle;
  const { user } = useAuthContext();
  const userTimezone = user?.timezone || DEFAULT_TIMEZONE;
  const { squad, isLoading, isFetched } = useSquad({ handle: handle || '' });
  const canViewAnalytics = verifyPermission(
    squad,
    SourcePermissions.ViewAnalytics,
  );

  const { data: analytics } = useQuery({
    ...squadAnalyticsQueryOptions({ sourceId: squad?.id }),
    enabled: !!squad?.id && canViewAnalytics,
  });

  const { data: history } = useQuery({
    ...squadAnalyticsHistoryQueryOptions({ sourceId: squad?.id }),
    enabled: !!squad?.id && canViewAnalytics,
  });

  useEffect(() => {
    if (!isFetched || isLoading) {
      return;
    }

    if (!squad || !canViewAnalytics) {
      router.replace(handle ? `/squads/${handle}` : '/');
    }
  }, [canViewAnalytics, handle, isFetched, isLoading, router, squad]);

  const impressionsData = useMemo((): ImpressionNode[] => {
    if (!history) {
      return [];
    }

    const impressionsMap = history.reduce((acc, item) => {
      const date = dateFormatInTimezone(
        new Date(item.date),
        'yyyy-MM-dd',
        userTimezone,
      );

      acc[date] = {
        name: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        value: item.impressions,
        isBoosted: item.impressionsAds > 0,
      };

      return acc;
    }, {} as Record<string, ImpressionNode>);

    const historyCutOffDate = subDays(new Date(), HISTORY_LIMIT - 1);
    const data: ImpressionNode[] = [];

    for (let i = 0; i < HISTORY_LIMIT; i += 1) {
      const paddedDate = addDays(historyCutOffDate, i);
      const date = dateFormatInTimezone(paddedDate, 'yyyy-MM-dd', userTimezone);

      if (impressionsMap[date]) {
        data.push(impressionsMap[date]);
      } else {
        data.push({
          name: paddedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          value: 0,
          isBoosted: false,
        });
      }
    }

    return data;
  }, [history, userTimezone]);

  const engagementData: AnalyticsNumberList = [
    {
      icon: <UpvoteIcon />,
      label: 'Upvotes',
      value: analytics?.upvotes ?? 0,
    },
    {
      icon: <MergeIcon />,
      label: 'Upvotes ratio',
      value: `${analytics?.upvotesRatio ?? 0}%`,
      tooltip: 'The percentage of upvotes out of total votes.',
    },
    {
      icon: <DiscussIcon />,
      label: 'Comments',
      value: analytics?.comments ?? 0,
    },
    {
      icon: <BookmarkIcon />,
      label: 'Bookmarks',
      value: analytics?.bookmarks ?? 0,
    },
    {
      icon: <MedalBadgeIcon secondary />,
      label: 'Awards',
      value: analytics?.awards ?? 0,
    },
    {
      icon: <ShareIcon />,
      label: 'Shares',
      value: analytics?.shares ?? 0,
    },
    {
      icon: <ClickIcon />,
      label: 'Clicks',
      value: analytics?.clicks ?? 0,
    },
  ];

  const hasChartData = impressionsData.some((item) => item.value > 0);

  if (isLoading || !isFetched || !squad || !canViewAnalytics) {
    return <></>;
  }

  return (
    <div className="mx-auto w-full max-w-[48rem]">
      <LayoutHeader className={classNames('!mb-0 border-b px-4', pageBorders)}>
        <PageHeaderTitle bold type={TypographyType.Title3}>
          Squad analytics
        </PageHeaderTitle>
      </LayoutHeader>

      <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6">
        <SectionContainer>
          <SectionHeader>Discovery (last 45 days)</SectionHeader>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <DataTile
              label="Impressions"
              value={analytics?.impressions ?? 0}
              info="The total number of times posts from this squad were shown to developers across the platform"
              icon={
                <EyeIcon size={IconSize.Small} className="text-text-tertiary" />
              }
            />
            <DataTile
              label="Unique reach"
              value={analytics?.reach ?? 0}
              info="The estimated number of unique developers who viewed posts from this squad"
              icon={
                <EyeIcon size={IconSize.Small} className="text-text-tertiary" />
              }
            />
          </div>
        </SectionContainer>

        <Divider className={dividerClassName} />

        <SectionContainer>
          <SectionHeader>Impressions over time</SectionHeader>
          {hasChartData ? (
            <CombinedImpressionsChart data={impressionsData} />
          ) : (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              No impressions data in the last 45 days.
            </Typography>
          )}
        </SectionContainer>

        <Divider className={dividerClassName} />

        <SectionContainer>
          <SectionHeader>Engagement (last 45 days)</SectionHeader>
          <AnalyticsNumbersList data={engagementData} />
        </SectionContainer>
      </ResponsivePageContainer>
    </div>
  );
};

SquadAnalyticsPage.getLayout = getMainLayout;

export default SquadAnalyticsPage;

import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Divider } from '../../utilities/Divider';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import {
  ReputationPeriod,
  reputationEventsQueryOptions,
  reputationOverviewQueryOptions,
  reputationTopSourcesQueryOptions,
} from '../../../graphql/reputation';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { CreatorDashboardError } from '../creator/CreatorDashboardError';
import { reputationPeriodLabel, reputationPeriodOptions } from './common';
import { ReputationSummary } from './ReputationSummary';
import { ReputationHistoryChart } from './ReputationHistoryChart';
import { ReputationShape } from './ReputationShape';
import { ReputationTopSources } from './ReputationTopSources';
import { ReputationActivity } from './ReputationActivity';

const Section = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Typography
        type={TypographyType.Body}
        bold
        tag={TypographyTag.H2}
        color={TypographyColor.Primary}
      >
        {title}
      </Typography>
      {action}
    </div>
    {children}
  </section>
);

const PeriodSelect = ({
  period,
  onChange,
}: {
  period: ReputationPeriod;
  onChange: (period: ReputationPeriod) => void;
}): ReactElement => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        aria-label={`Period: ${reputationPeriodLabel[period]}. Change period.`}
        icon={<ArrowIcon size={IconSize.XSmall} className="rotate-180" />}
        iconPosition={ButtonIconPosition.Right}
      >
        {reputationPeriodLabel[period]}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {reputationPeriodOptions.map((option) => (
        <DropdownMenuItem
          key={option}
          onClick={() => onChange(option)}
          aria-current={option === period}
        >
          {reputationPeriodLabel[option]}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const dividerClassName = 'bg-border-subtlest-tertiary';

const SectionError = ({
  title,
  query,
}: {
  title: string;
  query: { refetch: () => unknown; isFetching: boolean };
}): ReactElement => (
  <CreatorDashboardError
    title={title}
    onRetry={() => query.refetch()}
    isRetrying={query.isFetching}
  />
);

/** The Reputation tab of Analytics: every number belongs to the viewer. */
export const ReputationDashboard = (): ReactElement => {
  const { user } = useAuthContext();
  const [period, setPeriod] = useState(ReputationPeriod.Last30Days);
  const overviewQuery = useQuery({
    ...reputationOverviewQueryOptions({ user, period }),
    placeholderData: keepPreviousData,
  });
  const topSourcesQuery = useQuery(reputationTopSourcesQueryOptions({ user }));
  const eventsQuery = useInfiniteQuery(reputationEventsQueryOptions({ user }));
  const events = useMemo(
    () =>
      eventsQuery.data?.pages.flatMap((page) =>
        page.edges.map(({ node }) => node),
      ) ?? [],
    [eventsQuery.data],
  );
  const overview = overviewQuery.data;
  const periodText = reputationPeriodLabel[period].toLowerCase();

  if (overviewQuery.isError && !overview) {
    return (
      <SectionError
        title="Could not load your reputation"
        query={overviewQuery}
      />
    );
  }

  if (!overview) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <ElementPlaceholder className="h-36 w-full rounded-16" />
        <ElementPlaceholder className="h-60 w-full rounded-12" />
        <ElementPlaceholder className="h-60 w-full rounded-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ReputationSummary
        reputation={overview.reputation}
        periodChange={overview.periodChange}
        period={period}
      />
      <Section
        title="Reputation over time"
        action={<PeriodSelect period={period} onChange={setPeriod} />}
      >
        <ReputationHistoryChart history={overview.history} />
      </Section>
      <Divider className={dividerClassName} />
      <Section title={`Where it came from · ${periodText}`}>
        <ReputationShape breakdown={overview.breakdown} />
      </Section>
      <Divider className={dividerClassName} />
      <Section title="What earned you the most">
        {topSourcesQuery.isPending && (
          <ElementPlaceholder className="h-40 w-full rounded-12" />
        )}
        {topSourcesQuery.isError && (
          <SectionError
            title="Could not load what earned you the most"
            query={topSourcesQuery}
          />
        )}
        {topSourcesQuery.data && (
          <ReputationTopSources sources={topSourcesQuery.data} />
        )}
      </Section>
      <Divider className={dividerClassName} />
      <Section title="Activity">
        {eventsQuery.isPending && (
          <ElementPlaceholder className="h-60 w-full rounded-12" />
        )}
        {eventsQuery.isError && !events.length && (
          <SectionError
            title="Could not load your activity"
            query={eventsQuery}
          />
        )}
        {eventsQuery.isSuccess && (
          <ReputationActivity
            events={events}
            untracked={overview.untracked}
            trackedSince={overview.trackedSince}
            hasMore={eventsQuery.hasNextPage}
            isLoadingMore={eventsQuery.isFetchingNextPage}
            onLoadMore={() => eventsQuery.fetchNextPage()}
          />
        )}
      </Section>
    </div>
  );
};

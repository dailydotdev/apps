import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import subDays from 'date-fns/subDays';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { DataTile } from '../../../../components/DataTile';
import { LockIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { AgentViewsHistoryItem } from '../../../../components/analytics/agentViews';
import {
  AgentViewsSeries,
  agentViewsVendorSeries,
} from '../../../../components/analytics/agentViews';
import { postAnalyticsHistoryLimit } from '../../../../graphql/posts';
import {
  StartupsPromoSpot,
  useStartupsPromo,
} from '../../hooks/useStartupsPromo';
import { MonthlyCredits } from './StartupsPromo';

const AgentViewsChart = dynamic(
  () =>
    import('../../../../components/analytics/AgentViewsChart').then(
      (mod) => mod.AgentViewsChart,
    ),
  {
    loading: () => <div className="h-40 w-full" />,
  },
);

const previewVeil =
  'radial-gradient(70% 70% at 50% 50%, color-mix(in srgb, var(--theme-background-default) 85%, transparent) 0%, color-mix(in srgb, var(--theme-background-default) 40%, transparent) 100%)';

const previewSeries = [
  AgentViewsSeries.Chatgpt,
  AgentViewsSeries.Claude,
  AgentViewsSeries.Perplexity,
];

// Made-up numbers: the chart only shows blurred, behind the plan
const getPreviewHistory = (): AgentViewsHistoryItem[] =>
  Array.from({ length: postAnalyticsHistoryLimit }, (_, index) => {
    const wave = (offset: number, scale: number) =>
      Math.round(scale * (2 + Math.sin(index / 4 + offset) + index / 30));

    return {
      date: subDays(new Date(), postAnalyticsHistoryLimit - 1 - index),
      [AgentViewsSeries.Chatgpt]: wave(0, 6),
      [AgentViewsSeries.Claude]: wave(2, 4),
      [AgentViewsSeries.Perplexity]: wave(4, 2),
      agentViewsChatgptBot: wave(1, 14),
      agentViewsClaudeBot: wave(3, 10),
      agentViewsPerplexityBot: wave(5, 5),
    };
  });

const agentNames = agentViewsVendorSeries
  .slice(0, 4)
  .map(({ label }) => label)
  .join(', ');

/**
 * Stands in for the AI agents section of post and squad analytics when the
 * squad has no daily.dev for Startups plan: a blurred preview and the pitch.
 */
export const StartupsAgentAnalyticsPromo = ({
  sourceId,
  isSquadAnalytics = false,
  wrapper,
}: {
  /** The squad the analytics are for, or the post's squad */
  sourceId?: string;
  isSquadAnalytics?: boolean;
  /** The page's section around it, so nothing renders when it doesn't show */
  wrapper: (promo: ReactNode) => ReactElement;
}): ReactElement | null => {
  const promo = useStartupsPromo({
    spot: isSquadAnalytics
      ? StartupsPromoSpot.SquadAnalytics
      : StartupsPromoSpot.PostAnalytics,
    sourceId,
    isPersonalAllowed: !isSquadAnalytics,
    isDismissible: false,
  });
  const history = useMemo(getPreviewHistory, []);

  if (!promo.isShown) {
    return null;
  }

  return wrapper(
    <div className="grid overflow-hidden rounded-16 border border-border-subtlest-tertiary">
      <div
        aria-hidden
        className="pointer-events-none col-start-1 row-start-1 flex select-none flex-col gap-4 p-4 blur-sm"
      >
        <div className="flex gap-4">
          <DataTile
            label="AI agent reads"
            value={1240}
            className={{ container: 'flex-1' }}
          />
          <DataTile
            label="AI crawler visits"
            value={3870}
            className={{ container: 'flex-1' }}
          />
        </div>
        <AgentViewsChart history={history} visibleSeries={previewSeries} />
      </div>
      <div
        className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-3 p-6 text-center"
        style={{ background: previewVeil }}
      >
        <span className="flex size-10 items-center justify-center rounded-12 bg-overlay-float-cabbage text-accent-cabbage-default">
          <LockIcon size={IconSize.Medium} />
        </span>
        <Typography type={TypographyType.Body} bold tag={TypographyTag.H3}>
          {isSquadAnalytics
            ? 'See which AI agents read this squad'
            : 'See which AI agents read your post'}
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-md"
        >
          {`${agentNames} read posts on daily.dev when someone asks them about a topic. `}
          {promo.squad ? (
            <>
              {`Upgrade ${promo.squad.name} to the Startup plan for ${promo.starterPrice} a month to see every read and crawl, day by day, with `}
              <MonthlyCredits promo={promo} /> every month.
            </>
          ) : (
            <>
              {`Get a company page for ${promo.starterPrice} a month to see every read and crawl, day by day, with `}
              <MonthlyCredits promo={promo} /> every month.
            </>
          )}
        </Typography>
        <Button
          tag="a"
          href={promo.href}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={promo.onClick}
        >
          See plans
        </Button>
      </div>
    </div>,
  );
};

import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Squad } from '../../../../graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import Link from '../../../../components/utilities/Link';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { SquadWidget } from './SquadWidget';
import { useSquadAnalytics } from '../../hooks/useSquadAnalytics';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';

interface SquadAnalyticsWidgetProps {
  squad: Squad;
}

const Tile = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center rounded-12 border border-border-subtlest-tertiary p-2 text-center">
    <span className="font-bold text-text-primary typo-callout">
      {largeNumberFormat(value) ?? 0}
    </span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

export const SquadAnalyticsWidget = ({
  squad,
}: SquadAnalyticsWidgetProps): ReactElement | null => {
  const { canViewAnalytics, analytics, impressions, hasImpressions } =
    useSquadAnalytics(squad);

  if (!canViewAnalytics) {
    return null;
  }

  const peak = Math.max(...impressions.map((day) => day.value), 1);
  const engagement = [
    ['Upvotes', analytics?.upvotes],
    ['Comments', analytics?.comments],
    ['Bookmarks', analytics?.bookmarks],
    ['Shares', analytics?.shares],
  ] as const;

  return (
    <SquadWidget title="Analytics">
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Tile label="Impressions" value={analytics?.impressions ?? 0} />
        <Tile label="Reach" value={analytics?.reach ?? 0} />
      </div>
      {hasImpressions && (
        <div
          role="img"
          aria-label="Impressions per day, last 45 days"
          className="mt-4 flex h-12 items-end gap-px"
        >
          {impressions.map((day) => (
            <span
              key={day.name}
              className={classNames(
                'min-w-0 flex-1 rounded-t-2',
                day.isBoosted
                  ? 'bg-accent-cabbage-default'
                  : 'bg-text-disabled',
              )}
              style={{ height: `${(day.value / peak) * 100}%` }}
            />
          ))}
        </div>
      )}
      <dl className="mt-4 flex flex-col">
        {engagement.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between py-1.5 typo-footnote"
          >
            <dt className="text-text-tertiary">{label}</dt>
            <dd className="font-bold tabular-nums text-text-primary">
              {largeNumberFormat(value ?? 0) ?? 0}
            </dd>
          </div>
        ))}
      </dl>
      <Link
        href={getSquadManageUrl(squad.handle, SquadManageSection.Analytics)}
        passHref
      >
        <Button
          tag="a"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          className="mt-3 w-full"
        >
          View analytics
        </Button>
      </Link>
    </SquadWidget>
  );
};

import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { StarterUpgrade } from './StarterUpgrade';

export interface SquadValueStats {
  impressions: number;
  reach: number;
  clicks: number;
  /** Upvotes, comments and Bookmarks together */
  engagement: number;
  followers: number;
  /** AI agent reads plus AI crawler visits; only paid pages get them */
  agentViews?: number | null;
}

export interface SquadValueUpgrade {
  offer: StartupsStarterOffer;
  checkoutUrl: string;
  onClick?: () => void;
}

interface SquadValuePanelProps {
  name: string;
  stats: SquadValueStats;
  /** Set on the free plan: the one block on the page that sells Starter */
  upgrade?: SquadValueUpgrade;
  className?: string;
}

const number = (value: number): string => value.toLocaleString('en-US');

const tilesColumns: Record<number, string> = {
  1: 'tablet:grid-cols-2',
  2: 'tablet:grid-cols-2',
  3: 'tablet:grid-cols-3',
  4: 'tablet:grid-cols-4',
  5: 'tablet:grid-cols-5',
};

const Tile = ({
  value,
  label,
}: {
  value: number;
  label: string;
}): ReactElement => (
  <div className="flex flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary p-3">
    <span className="font-bold tabular-nums typo-title2">{number(value)}</span>
    <span className="text-text-secondary typo-footnote">{label}</span>
  </div>
);

const Panel = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <section
    className={classNames(
      'flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-5',
      className,
    )}
  >
    <span className="text-text-tertiary typo-caption1">
      Only admins see this
    </span>
    {children}
  </section>
);

/** Holds the panel's place while its numbers load, so the feed doesn't jump */
export const SquadValuePanelPlaceholder = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <ElementPlaceholder
    className={classNames('h-64 w-full rounded-16', className)}
  />
);

/**
 * The value a company page got from daily.dev, for its admins: impressions first,
 * then the other big numbers, leaving out any that are still zero. On the free
 * plan it ends with the page's one upgrade block.
 */
export const SquadValuePanel = ({
  name,
  stats,
  upgrade,
  className,
}: SquadValuePanelProps): ReactElement => {
  if (!stats.impressions) {
    // Nothing to show off yet: a free page keeps only its upgrade block
    return upgrade ? (
      <StarterUpgrade
        name={name}
        offer={upgrade.offer}
        checkoutUrl={upgrade.checkoutUrl}
        onClick={upgrade.onClick}
        className={className}
      />
    ) : (
      <Panel className={className}>
        <p className="text-text-tertiary typo-callout">
          Your numbers show up here once developers read your posts.
        </p>
      </Panel>
    );
  }

  const tiles = [
    { value: stats.reach, label: 'Reach' },
    { value: stats.clicks, label: 'Clicks' },
    { value: stats.engagement, label: 'Engagement' },
    { value: stats.followers, label: 'Followers' },
    { value: stats.agentViews ?? 0, label: 'AI visits' },
  ].filter(({ value }) => value > 0);

  return (
    <Panel className={className}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-bold tabular-nums typo-mega2 tablet:typo-mega1">
          {number(stats.impressions)}
        </span>
        <span className="font-bold typo-title3">impressions so far</span>
      </div>
      {!!tiles.length && (
        <div
          className={classNames(
            'grid grid-cols-2 gap-2',
            tilesColumns[tiles.length],
          )}
        >
          {tiles.map(({ value, label }) => (
            <Tile key={label} value={value} label={label} />
          ))}
        </div>
      )}
      {upgrade && (
        <StarterUpgrade
          name={name}
          offer={upgrade.offer}
          checkoutUrl={upgrade.checkoutUrl}
          onClick={upgrade.onClick}
        />
      )}
    </Panel>
  );
};

import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { SquadStatsRow } from './SquadStatsRow';
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
  /** The page's full analytics in its settings */
  analyticsUrl: string;
  className?: string;
}

const Panel = ({
  analyticsUrl,
  className,
  children,
}: {
  analyticsUrl: string;
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <section
    className={classNames(
      'flex flex-col gap-4 border-b border-border-subtlest-tertiary px-4 pb-5 tablet:-mx-6 tablet:px-6',
      className,
    )}
  >
    <div className="flex items-center gap-2">
      <h2 className="font-bold typo-callout">Page analytics</h2>
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
        Only admins see this
      </span>
      <a
        href={analyticsUrl}
        className="flex shrink-0 items-center gap-1 font-bold text-text-primary typo-footnote hover:underline"
      >
        View analytics
        <MoveToIcon size={IconSize.Size16} className="shrink-0" />
      </a>
    </div>
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
  analyticsUrl,
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
      <Panel analyticsUrl={analyticsUrl} className={className}>
        <p className="text-text-tertiary typo-callout">
          Your numbers show up here once developers read your posts.
        </p>
      </Panel>
    );
  }

  return (
    <Panel analyticsUrl={analyticsUrl} className={className}>
      <SquadStatsRow
        lead={{ label: 'Impressions', value: stats.impressions }}
        stats={[
          { label: 'Reach', value: stats.reach },
          { label: 'Clicks', value: stats.clicks },
          { label: 'Engagement', value: stats.engagement },
          { label: 'Followers', value: stats.followers },
          { label: 'AI visits', value: stats.agentViews ?? 0 },
        ]}
      />
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

import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { MonthlyCredits } from '../promos/StartupsPromo';

export interface SquadValueStats {
  impressions: number;
  reach: number;
  clicks: number;
  /** Upvotes, comments and Bookmarks together */
  engagement: number;
  followers: number;
  /** AI agent reads; only paid pages get them */
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

const Fact = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2.5 typo-footnote">
    <VIcon
      size={IconSize.Size16}
      className="shrink-0 text-accent-avocado-default"
    />
    <span className="text-text-tertiary">
      <strong className="text-text-primary">{name}</strong>
      {' · '}
      {children}
    </span>
  </div>
);

const Benefit = ({ children }: { children: ReactNode }): ReactElement => (
  <li className="flex items-start gap-2 text-text-secondary typo-callout">
    <VIcon
      size={IconSize.Size16}
      className="mt-0.5 shrink-0 text-accent-cabbage-default"
    />
    <span className="min-w-0 flex-1">{children}</span>
  </li>
);

const Upgrade = ({
  name,
  upgrade,
  className,
}: {
  name: string;
  upgrade: SquadValueUpgrade;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-3 rounded-12 bg-overlay-float-cabbage p-4',
      className,
    )}
  >
    <h3 className="font-bold typo-body">
      {`With Starter, ${name} reaches more developers:`}
    </h3>
    <ul className="flex flex-col gap-2">
      <Benefit>Your posts in the developer feed</Benefit>
      <Benefit>{`${name} on Google and in AI answers`}</Benefit>
      <Benefit>
        <MonthlyCredits promo={upgrade.offer} /> every month
      </Benefit>
    </ul>
    <Button
      tag="a"
      href={upgrade.checkoutUrl}
      onClick={upgrade.onClick}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="self-start"
    >
      Keep the reach going
    </Button>
  </div>
);

/**
 * What daily.dev did for a company page, for its admins: impressions first,
 * then the other big numbers. On the free plan it ends with the page's one
 * upgrade block; on a paid plan it shows Google and AI agents instead.
 */
export const SquadValuePanel = ({
  name,
  stats,
  upgrade,
  className,
}: SquadValuePanelProps): ReactElement | null => {
  // Nothing to show off yet: a free page keeps only its upgrade block
  if (!stats.impressions) {
    return upgrade ? (
      <Upgrade name={name} upgrade={upgrade} className={className} />
    ) : null;
  }

  return (
    <section
      className={classNames(
        'flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold typo-callout">{`What daily.dev did for ${name}`}</h2>
        <span className="shrink-0 text-text-tertiary typo-caption1">
          Only admins see this
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-bold tabular-nums typo-mega2 tablet:typo-mega1">
          {number(stats.impressions)}
        </span>
        <span className="font-bold typo-title3">impressions so far</span>
      </div>
      <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
        <Tile value={stats.reach} label="Developers reached" />
        <Tile value={stats.clicks} label="Clicks" />
        <Tile
          value={stats.engagement}
          label="Upvotes, comments and Bookmarks"
        />
        <Tile value={stats.followers} label="Followers" />
      </div>
      {upgrade ? (
        <Upgrade name={name} upgrade={upgrade} />
      ) : (
        <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
          <Fact name="Google">Your page and posts are open to search</Fact>
          <Fact name="AI agents">
            {`Read your posts ${number(stats.agentViews ?? 0)} times`}
          </Fact>
        </div>
      )}
    </section>
  );
};

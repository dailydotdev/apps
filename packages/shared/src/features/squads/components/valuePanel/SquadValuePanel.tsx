import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { LockIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { MonthlyCredits } from '../promos/StartupsPromo';

export interface SquadValueStats {
  impressions: number;
  reach: number;
  /** Visits to the company's site from its posts */
  clicks: number;
  /** Upvotes, comments and Bookmarks together */
  engagement: number;
  followers: number;
  /** AI agent reads; unset on the free plan */
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
  /** Set on the free plan: Google and AI agents show locked, with the offer */
  upgrade?: SquadValueUpgrade;
  /** The free boost card, shown above the numbers while it has something to say */
  boost?: ReactNode;
  className?: string;
}

const numberFormat = new Intl.NumberFormat('en-US');

const Stat = ({
  value,
  label,
  isLead,
}: {
  value: number;
  label: string;
  isLead?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary p-3',
      isLead && 'col-span-2 justify-center',
    )}
  >
    <span
      className={classNames(
        'font-bold tabular-nums text-text-primary',
        isLead ? 'typo-large-title' : 'typo-title3',
      )}
    >
      {numberFormat.format(value)}
    </span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

const Reach = ({
  name,
  children,
  action,
}: {
  name: string;
  children: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <div className="flex min-h-11 items-center gap-2 rounded-12 bg-surface-float px-3 py-2 typo-footnote">
    <span className="min-w-0 flex-1 text-text-tertiary">
      <strong className="text-text-primary">{name}</strong>
      {' · '}
      {children}
    </span>
    {action}
  </div>
);

/**
 * What daily.dev did for a company page, for its admins: the big numbers,
 * led by impressions, and whether Google and AI agents can find it.
 */
export const SquadValuePanel = ({
  name,
  stats,
  upgrade,
  boost,
  className,
}: SquadValuePanelProps): ReactElement => {
  const unlock = upgrade && (
    <a
      href={upgrade.checkoutUrl}
      onClick={upgrade.onClick}
      className="flex shrink-0 items-center gap-1 font-bold text-accent-cabbage-default"
    >
      <LockIcon size={IconSize.Size16} />
      Unlock
    </a>
  );

  return (
    <section
      className={classNames(
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4',
        className,
      )}
    >
      <div className="flex flex-col gap-1 tablet:flex-row tablet:items-baseline tablet:justify-between tablet:gap-4">
        <h2 className="font-bold typo-title3">{`What daily.dev did for ${name}`}</h2>
        <span className="shrink-0 text-text-quaternary typo-caption1">
          All time · Only admins see this
        </span>
      </div>
      {boost}
      <div className="grid grid-cols-2 gap-2 tablet:grid-cols-6">
        <Stat value={stats.impressions} label="Impressions" isLead />
        <Stat value={stats.reach} label="Developers reached" />
        <Stat value={stats.clicks} label="Visits to your site" />
        <Stat
          value={stats.engagement}
          label="Upvotes, comments and Bookmarks"
        />
        <Stat value={stats.followers} label="Followers" />
      </div>
      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
        <Reach name="Google" action={unlock}>
          {upgrade
            ? 'Not indexed on the free plan'
            : 'Your page and posts are open to search'}
        </Reach>
        <Reach name="AI agents" action={unlock}>
          {upgrade
            ? 'Your posts are hidden from them'
            : `Read your posts ${numberFormat.format(
                stats.agentViews ?? 0,
              )} times`}
        </Reach>
      </div>
      {upgrade && (
        <div className="flex flex-col gap-3 rounded-12 bg-overlay-float-cabbage p-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="min-w-0 flex-1 text-text-secondary typo-footnote">
            Starter puts your posts in the developer feed, gets {name} on Google
            and in AI answers, and adds{' '}
            <strong className="text-text-primary">
              <MonthlyCredits promo={upgrade.offer} />
            </strong>{' '}
            every month.
          </p>
          <Button
            tag="a"
            href={upgrade.checkoutUrl}
            onClick={upgrade.onClick}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="shrink-0"
          >
            See plans
          </Button>
        </div>
      )}
    </section>
  );
};

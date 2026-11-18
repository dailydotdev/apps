import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { differenceInMinutes } from 'date-fns';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { BoostIcon } from '../../../../components/icons/Boost';
import { IconSize } from '../../../../components/Icon';
import { ProgressBar } from '../../../../components/fields/ProgressBar';
import { LazyImage } from '../../../../components/LazyImage';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { MonthlyCredits } from '../promos/StartupsPromo';

/** What the free boost has delivered so far, from the post's analytics */
export interface FreeBoostStats {
  impressions: number;
  reach: number;
  clicks: number;
  bookmarks: number;
  followers: number;
}

export interface FreeBoostPost {
  title: string;
  image?: string;
  permalink: string;
}

interface FirstPostProps {
  state: 'first_post';
  /** The composer, opened on this company page */
  composeUrl: string;
}

interface LiveProps {
  state: 'live';
  post: FreeBoostPost;
  stats: FreeBoostStats;
  /** Cores spent so far; 100 Cores = $1 */
  spent: number;
  budget: number;
  endsAt: Date;
  now?: Date;
}

interface EndedProps {
  state: 'ended';
  post: FreeBoostPost;
  stats: FreeBoostStats;
  offer: StartupsStarterOffer;
  checkoutUrl: string;
  onUpgradeClick?: () => void;
}

export type FreeBoostCardProps = (FirstPostProps | LiveProps | EndedProps) & {
  className?: string;
};

const BOOST_DOLLARS = 100;

const number = (value: number): string => value.toLocaleString('en-US');

const dollars = (cores: number): string => `$${Math.round(cores / 100)}`;

const timeLeft = (endsAt: Date, now: Date): string => {
  const minutes = Math.max(differenceInMinutes(endsAt, now), 0);

  if (minutes < 60) {
    return `${Math.max(minutes, 1)} min left`;
  }

  const hours = Math.round(minutes / 60);

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
};

const cabbageGlow =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 160px)';

const Card = ({
  children,
  className,
  isHighlighted,
}: {
  children: ReactNode;
  className?: string;
  isHighlighted?: boolean;
}): ReactElement => (
  <section
    className={classNames(
      'flex w-full flex-col gap-4 rounded-16 border p-4 tablet:p-5',
      isHighlighted
        ? 'border-accent-cabbage-default'
        : 'border-border-subtlest-tertiary',
      className,
    )}
    style={{ background: cabbageGlow }}
  >
    {children}
  </section>
);

const Eyebrow = ({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}): ReactElement => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex items-center gap-1.5 rounded-8 bg-overlay-float-cabbage px-2 py-1 font-bold text-accent-cabbage-default typo-caption1">
      {children}
    </span>
    {aside && <span className="text-text-tertiary typo-caption1">{aside}</span>}
  </div>
);

const LiveDot = (): ReactElement => (
  <span className="relative flex size-2">
    <span className="opacity-60 absolute inline-flex size-full animate-ping rounded-full bg-accent-avocado-default" />
    <span className="relative inline-flex size-2 rounded-full bg-accent-avocado-default" />
  </span>
);

/** The big number every state leads with: impressions */
const Lead = ({
  value,
  label,
}: {
  value: number;
  label: string;
}): ReactElement => (
  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <span className="font-bold tabular-nums typo-mega2 tablet:typo-mega1">
      {number(value)}
    </span>
    <span className="font-bold typo-title3">{label}</span>
  </div>
);

const Tiles = ({ stats }: { stats: FreeBoostStats }): ReactElement => {
  const tiles = [
    { label: 'Developers reached', value: stats.reach },
    { label: 'Clicks', value: stats.clicks },
    { label: 'Bookmarks', value: stats.bookmarks },
    { label: 'New followers', value: stats.followers, isGain: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
      {tiles.map(({ label, value, isGain }) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3"
        >
          <span className="font-bold tabular-nums typo-title2">
            {isGain && value > 0 ? `+${number(value)}` : number(value)}
          </span>
          <span className="text-text-secondary typo-footnote">{label}</span>
        </div>
      ))}
    </div>
  );
};

const PostRow = ({ post }: { post: FreeBoostPost }): ReactElement => (
  <a
    href={post.permalink}
    className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-default p-2 pr-3 hover:bg-surface-hover"
  >
    {post.image && (
      <LazyImage
        imgSrc={post.image}
        imgAlt=""
        className="h-10 w-16 shrink-0 rounded-8"
      />
    )}
    <span className="line-clamp-2 min-w-0 flex-1 font-bold typo-footnote">
      {post.title}
    </span>
  </a>
);

const FirstPost = ({ composeUrl }: FirstPostProps): ReactElement => (
  <>
    <Eyebrow aside="Only admins see this">
      <BoostIcon size={IconSize.Size16} secondary />
      {`$${BOOST_DOLLARS} boost, on us`}
    </Eyebrow>
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title2">
        {`Write your first post and we'll boost it with $${BOOST_DOLLARS}`}
      </h2>
      <p className="text-text-secondary typo-callout">
        It goes out to thousands of developers in the US, Europe and other top
        markets on the day you post. Your results show up here.
      </p>
    </div>
    <Button
      tag="a"
      href={composeUrl}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="self-start"
    >
      Write your first post
    </Button>
  </>
);

const Live = ({
  post,
  stats,
  spent,
  budget,
  endsAt,
  now = new Date(),
}: LiveProps): ReactElement => (
  <>
    <Eyebrow aside={timeLeft(endsAt, now)}>
      <LiveDot />
      {`Your $${BOOST_DOLLARS} boost is live`}
    </Eyebrow>
    <Lead value={stats.impressions} label="impressions so far" />
    <Tiles stats={stats} />
    <PostRow post={post} />
    <div className="flex flex-col gap-2">
      <ProgressBar
        percentage={Math.min((spent / budget) * 100, 100)}
        shouldShowBg
        className={{ wrapper: 'h-2 rounded-8', bar: 'h-full rounded-8' }}
      />
      <span className="text-text-tertiary typo-footnote">
        {`${dollars(spent)} of $${BOOST_DOLLARS} spent`}
      </span>
    </div>
  </>
);

const Ended = ({
  post,
  stats,
  offer,
  checkoutUrl,
  onUpgradeClick,
}: EndedProps): ReactElement => (
  <>
    <Eyebrow aside="Only admins see this">
      <BoostIcon size={IconSize.Size16} secondary />
      {`Your $${BOOST_DOLLARS} boost results`}
    </Eyebrow>
    <Lead value={stats.impressions} label="impressions for your first post" />
    <Tiles stats={stats} />
    <PostRow post={post} />
    <div className="flex flex-col gap-3 rounded-12 bg-overlay-float-cabbage p-4 tablet:flex-row tablet:items-center tablet:gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-bold typo-body">
          Your next posts won&apos;t get this reach without a boost
        </h3>
        <p className="text-text-secondary typo-callout">
          Starter puts <MonthlyCredits promo={offer} /> back in your wallet
          every month, so you can boost like this again. Your page also shows up
          on Google and in AI answers.
        </p>
      </div>
      <Button
        tag="a"
        href={checkoutUrl}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="shrink-0"
        onClick={onUpgradeClick}
      >
        Keep the reach going
      </Button>
    </div>
  </>
);

/**
 * The free $100 boost a new company page gets on its first post, for its
 * admins: the nudge to write that post, the boost while it runs, and its
 * results with the upgrade once it ends.
 */
export const FreeBoostCard = (props: FreeBoostCardProps): ReactElement => {
  const { className } = props;

  return (
    <Card className={className} isHighlighted={props.state === 'live'}>
      {props.state === 'first_post' && <FirstPost {...props} />}
      {props.state === 'live' && <Live {...props} />}
      {props.state === 'ended' && <Ended {...props} />}
    </Card>
  );
};

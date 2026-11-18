import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { differenceInDays, differenceInMinutes } from 'date-fns';
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
  /** The page's offer ends 30 days after it was created */
  availableUntil?: Date;
  /** The latest post, held back for limited reach: the boost waits */
  heldPost?: FreeBoostPost;
  now?: Date;
}

interface PendingProps {
  state: 'pending';
  post: FreeBoostPost;
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

export type FreeBoostCardProps = (
  | FirstPostProps
  | PendingProps
  | LiveProps
  | EndedProps
) & {
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

const offerEnds = (availableUntil: Date, now: Date): string => {
  const days = Math.max(differenceInDays(availableUntil, now), 0);

  if (days === 0) {
    return 'Offer ends today';
  }

  return `Offer ends in ${days} ${days === 1 ? 'day' : 'days'}`;
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

// A tile at 0 says nothing good about the boost, so only the ones above 0 show
const tilesColumns: Record<number, string> = {
  1: 'tablet:grid-cols-2',
  2: 'tablet:grid-cols-2',
  3: 'tablet:grid-cols-3',
  4: 'tablet:grid-cols-4',
};

const Tiles = ({ stats }: { stats: FreeBoostStats }): ReactElement => {
  const tiles = [
    { label: 'Developers reached', value: stats.reach },
    { label: 'Clicks', value: stats.clicks },
    { label: 'Bookmarks', value: stats.bookmarks },
    { label: 'New followers', value: stats.followers, isGain: true },
  ].filter(({ label, value }) => value > 0 || label === 'Developers reached');

  return (
    <div
      className={classNames(
        'grid grid-cols-2 gap-2',
        tilesColumns[tiles.length],
      )}
    >
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

const PostRow = ({
  post,
  note,
}: {
  post: FreeBoostPost;
  note?: string;
}): ReactElement => (
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
    {note && (
      <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
        {note}
      </span>
    )}
  </a>
);

const FirstPost = ({
  composeUrl,
  availableUntil,
  heldPost,
  now = new Date(),
}: FirstPostProps): ReactElement => (
  <>
    <Eyebrow aside={availableUntil && offerEnds(availableUntil, now)}>
      <BoostIcon size={IconSize.Size16} secondary />
      {`$${BOOST_DOLLARS} boost, on us`}
    </Eyebrow>
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title2">
        {heldPost
          ? `Your next post gets the $${BOOST_DOLLARS} boost`
          : `Write your first post and we'll boost it with $${BOOST_DOLLARS}`}
      </h2>
      <p className="text-text-secondary typo-callout">
        {heldPost
          ? 'We expect your last post to reach fewer developers, so we saved the boost for your next one. Posts that teach developers something do best.'
          : 'It goes out to thousands of developers in the US, Europe and other top markets on the day you post. Your results show up here.'}
      </p>
    </div>
    {heldPost && <PostRow post={heldPost} note="Limited reach" />}
    <Button
      tag="a"
      href={composeUrl}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="self-start"
    >
      {heldPost ? 'Write your next post' : 'Write your first post'}
    </Button>
  </>
);

const Pending = ({ post }: PendingProps): ReactElement => (
  <>
    <Eyebrow aside="Only admins see this">
      <BoostIcon size={IconSize.Size16} secondary />
      {`$${BOOST_DOLLARS} boost, on us`}
    </Eyebrow>
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title2">
        Your boost starts in a few minutes
      </h2>
      <p className="text-text-secondary typo-callout">
        We&apos;re checking your post first. Then it goes out to developers in
        the US, Europe and other top markets.
      </p>
    </div>
    <PostRow post={post} />
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
    {stats.impressions > 0 ? (
      <>
        <Lead value={stats.impressions} label="impressions so far" />
        <Tiles stats={stats} />
      </>
    ) : (
      <div className="flex flex-col gap-1">
        <h2 className="font-bold typo-title2">
          Your post is going out to developers now
        </h2>
        <p className="text-text-secondary typo-callout">
          The first numbers show up here within minutes.
        </p>
      </div>
    )}
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
 * admins: the nudge to write that post, the checks before the boost starts,
 * the boost while it runs, and its results with the upgrade once it ends.
 */
export const FreeBoostCard = (props: FreeBoostCardProps): ReactElement => {
  const { className } = props;

  return (
    <Card className={className} isHighlighted={props.state === 'live'}>
      {props.state === 'first_post' && <FirstPost {...props} />}
      {props.state === 'pending' && <Pending {...props} />}
      {props.state === 'live' && <Live {...props} />}
      {props.state === 'ended' && <Ended {...props} />}
    </Card>
  );
};

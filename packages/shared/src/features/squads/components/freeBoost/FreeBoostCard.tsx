import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { differenceInMinutes } from 'date-fns';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ProgressBar } from '../../../../components/fields/ProgressBar';
import { LazyImage } from '../../../../components/LazyImage';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';

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

interface BoostingProps {
  state: 'boosting';
  post: FreeBoostPost;
  stats: FreeBoostStats;
  /** Cores spent so far; 100 Cores = $1 */
  spent: number;
  budget: number;
  /** Unset while the post's checks run, before the boost starts */
  endsAt?: Date;
  now?: Date;
}

/** Something the page needs before its boost can start */
export interface FreeBoostSetupStep {
  id: string;
  title: string;
  hint: string;
  isDone: boolean;
  href: string;
  cta: string;
}

interface SetupProps {
  state: 'setup';
  steps: FreeBoostSetupStep[];
}

export type FreeBoostCardProps = (
  | FirstPostProps
  | BoostingProps
  | SetupProps
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

/** The big number the boost leads with: impressions */
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

// A 0 says nothing good about the boost, so only the tiles above 0 show
const tilesColumns: Record<number, string> = {
  1: 'tablet:grid-cols-2',
  2: 'tablet:grid-cols-2',
  3: 'tablet:grid-cols-3',
  4: 'tablet:grid-cols-4',
};

const Tiles = ({ stats }: { stats: FreeBoostStats }): ReactElement | null => {
  const tiles = [
    { label: 'Reach', value: stats.reach },
    { label: 'Clicks', value: stats.clicks },
    { label: 'Bookmarks', value: stats.bookmarks },
    { label: 'New followers', value: stats.followers },
  ].filter(({ value }) => value > 0);

  if (!tiles.length) {
    return null;
  }

  return (
    <div
      className={classNames(
        'grid grid-cols-2 gap-2',
        tilesColumns[tiles.length],
      )}
    >
      {tiles.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3"
        >
          <span className="font-bold tabular-nums typo-title2">
            {largeNumberFormat(value)}
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

const Heading = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <h2 className="font-bold typo-title2">{title}</h2>
    <p className="text-text-secondary typo-callout">{children}</p>
  </div>
);

const FirstPost = ({ composeUrl }: FirstPostProps): ReactElement => (
  <>
    <Heading
      title={`Write your first post and we'll boost it with $${BOOST_DOLLARS}`}
    >
      It goes out to thousands of developers in the US, Europe and other top
      markets on the day you post. Your results show up here.
    </Heading>
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

const Boosting = ({
  post,
  stats,
  spent,
  budget,
  endsAt,
  now = new Date(),
}: BoostingProps): ReactElement => (
  <>
    {stats.impressions > 0 ? (
      <>
        <Lead value={stats.impressions} label="impressions so far" />
        <Tiles stats={stats} />
      </>
    ) : (
      <Heading
        title={
          endsAt
            ? 'Your post is going out to developers now'
            : 'Your boost starts in a few minutes'
        }
      >
        {endsAt
          ? 'The first numbers show up here within minutes.'
          : "We're checking your post first. Then it goes out to developers in the US, Europe and other top markets."}
      </Heading>
    )}
    <PostRow post={post} />
    <div className="flex flex-col gap-2">
      <ProgressBar
        percentage={Math.min((spent / budget) * 100, 100)}
        shouldShowBg
        className={{ wrapper: 'h-2 rounded-8', bar: 'h-full rounded-8' }}
      />
      {(spent > 0 || endsAt) && (
        <div className="flex justify-between gap-3 text-text-tertiary typo-footnote">
          <span>
            {spent > 0 && `${dollars(spent)} of $${BOOST_DOLLARS} spent`}
          </span>
          {endsAt && <span>{timeLeft(endsAt, now)}</span>}
        </div>
      )}
    </div>
  </>
);

const StepCheck = ({ isDone }: { isDone: boolean }): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex size-5 shrink-0 items-center justify-center rounded-full',
      isDone
        ? 'bg-accent-cabbage-default text-surface-invert'
        : 'border border-border-subtlest-secondary',
    )}
  >
    {isDone && <VIcon size={IconSize.Size16} secondary />}
  </span>
);

const Setup = ({ steps }: SetupProps): ReactElement => (
  <>
    <Heading title={`Finish your page to unlock your $${BOOST_DOLLARS} boost`}>
      Developers see your logo and description next to the boosted post, and
      many click through to your site. Add them and we&apos;ll boost your post.
    </Heading>
    <ul className="flex flex-col">
      {steps.map((step) => (
        <li key={step.id} className="flex items-center gap-3 py-2.5">
          <StepCheck isDone={step.isDone} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold typo-callout">{step.title}</span>
            <span className="text-pretty text-text-tertiary typo-footnote">
              {step.hint}
            </span>
          </span>
          <Button
            tag="a"
            href={step.href}
            variant={step.isDone ? ButtonVariant.Tertiary : ButtonVariant.Float}
            size={ButtonSize.Small}
            className="shrink-0"
          >
            {step.isDone ? 'Edit' : step.cta}
          </Button>
        </li>
      ))}
    </ul>
  </>
);

/**
 * The free $100 boost a new company page gets on its first post, for its
 * admins: what the page still needs, the nudge to write that post, then the
 * boost while it runs.
 */
export const FreeBoostCard = (props: FreeBoostCardProps): ReactElement => {
  const { className } = props;

  return (
    <Card className={className} isHighlighted={props.state === 'boosting'}>
      {props.state === 'first_post' && <FirstPost {...props} />}
      {props.state === 'boosting' && <Boosting {...props} />}
      {props.state === 'setup' && <Setup {...props} />}
    </Card>
  );
};

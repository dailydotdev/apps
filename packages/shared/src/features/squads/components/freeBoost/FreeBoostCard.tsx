import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { differenceInMinutes, isAfter } from 'date-fns';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { LazyImage } from '../../../../components/LazyImage';
import { MoveToIcon, OpenLinkIcon, VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  startupsLavender,
  startupsLavenderGlow,
  startupsLavenderInk,
  startupsLavenderWash,
} from '../../../../styles/custom';
import { StartupsFreeChip } from '../StartupsFreeChip';
import { SquadStatsRow } from '../valuePanel/SquadStatsRow';

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
  /** Where a free page gets credits every month */
  upgradeUrl?: string;
  onUpgrade?: () => void;
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

const dollars = (cores: number): string => `$${Math.round(cores / 100)}`;

const timeLeft = (endsAt: Date, now: Date): string => {
  const minutes = differenceInMinutes(endsAt, now);

  if (minutes < 60) {
    return `${Math.max(minutes, 1)} min left`;
  }

  const hours = Math.round(minutes / 60);

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
};

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
      'flex w-full flex-col gap-4 rounded-16 p-4 tablet:p-5',
      !isHighlighted && 'border border-border-subtlest-tertiary',
      className,
    )}
    style={{
      background: isHighlighted ? startupsLavenderWash : startupsLavenderGlow,
    }}
  >
    {children}
  </section>
);

const PostRow = ({ post }: { post: FreeBoostPost }): ReactElement => (
  <a
    href={post.permalink}
    className="group flex items-center gap-3 rounded-12 bg-background-default p-2 pr-3"
  >
    {post.image && (
      <LazyImage
        imgSrc={post.image}
        imgAlt=""
        className="h-10 w-16 shrink-0 rounded-8"
      />
    )}
    <span className="line-clamp-1 min-w-0 flex-1 font-bold typo-footnote group-hover:underline">
      {post.title}
    </span>
    <OpenLinkIcon
      size={IconSize.Size16}
      className="shrink-0 text-text-tertiary group-hover:text-text-primary"
    />
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
  upgradeUrl,
  onUpgrade,
}: BoostingProps): ReactElement => {
  // The boost keeps going past its end time until the budget is spent
  const isWithinTime = !!endsAt && isAfter(endsAt, now);

  return (
    <>
      <div className="flex items-center gap-2">
        {endsAt ? (
          <span
            className="rounded-6 px-1.5 py-0.5 font-bold uppercase typo-caption1"
            style={{ background: startupsLavender, color: startupsLavenderInk }}
          >
            Live
          </span>
        ) : (
          <StartupsFreeChip />
        )}
        <h2 className="min-w-0 flex-1 font-bold typo-body">
          {endsAt
            ? `Your free $${BOOST_DOLLARS} boost is running`
            : 'Your boost starts in a few minutes'}
        </h2>
        {isWithinTime && (
          <span className="shrink-0 text-text-tertiary typo-footnote">
            {timeLeft(endsAt, now)}
          </span>
        )}
      </div>
      <PostRow post={post} />
      {stats.impressions > 0 ? (
        <SquadStatsRow
          lead={{ label: 'Impressions', value: stats.impressions }}
          stats={[
            { label: 'Reach', value: stats.reach },
            { label: 'Clicks', value: stats.clicks },
            { label: 'Bookmarks', value: stats.bookmarks },
            { label: 'New followers', value: stats.followers },
          ]}
        />
      ) : (
        <p className="text-text-secondary typo-callout">
          {endsAt
            ? 'It is going out to developers now. The first numbers show up here within minutes.'
            : "We're checking your post first. Then it goes out to developers in the US, Europe and other top markets."}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-50 bg-border-subtlest-tertiary">
          <div
            className="h-full rounded-50"
            style={{
              background: startupsLavender,
              width: `${Math.min((spent / budget) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 typo-footnote">
          <span className="text-text-tertiary">
            {`${dollars(spent)} of $${BOOST_DOLLARS} in credits spent`}
          </span>
          {upgradeUrl && (
            <a
              href={upgradeUrl}
              onClick={onUpgrade}
              className="flex items-center gap-1 font-bold text-text-primary hover:underline"
            >
              Get boost credits every month
              <MoveToIcon size={IconSize.Size16} className="shrink-0" />
            </a>
          )}
        </div>
      </div>
    </>
  );
};

const StepCheck = ({ isDone }: { isDone: boolean }): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex size-5 shrink-0 items-center justify-center rounded-full',
      !isDone && 'border border-border-subtlest-secondary',
    )}
    style={
      isDone
        ? { background: startupsLavender, color: startupsLavenderInk }
        : undefined
    }
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

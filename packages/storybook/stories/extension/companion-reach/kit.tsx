import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BookmarkIcon,
  DiscussIcon,
  HelpIcon,
  HomeIcon,
  HashtagIcon,
  LockIcon,
  MenuIcon,
  NewPostIcon,
  RefreshIcon,
  SettingsIcon,
  ShareIcon,
  SquadIcon,
  UpvoteIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { TLDRText } from '@dailydotdev/shared/src/components/utilities';

// Shared pieces for the companion reach review. Everything here is drawn
// markup on production class recipes; the real components each idea would
// touch are named in its facts row.

export const noop = (): void => undefined;

export const Eyebrow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

export const Page = ({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-dvh bg-background-default text-text-primary antialiased">
    <div className="mx-auto flex max-w-[80rem] flex-col gap-12 px-6 py-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-balance font-bold typo-mega2">{title}</h1>
        {lead && (
          <div className="max-w-[90ch] text-pretty text-text-secondary typo-body">
            {lead}
          </div>
        )}
      </header>
      {children}
    </div>
  </div>
);

export const Section = ({
  title,
  lead,
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="text-balance font-bold typo-title2">{title}</h2>
      {lead && (
        <p className="max-w-[85ch] text-pretty text-text-tertiary typo-callout">
          {lead}
        </p>
      )}
    </div>
    {children}
  </section>
);

export enum Tier {
  Bet = 'Main bet',
  Test = 'Worth testing',
  Support = 'Supporting',
  Shipped = 'Shipped in #7043',
}

const tierClass: Record<Tier, string> = {
  [Tier.Bet]: 'bg-accent-avocado-flat text-accent-avocado-default',
  [Tier.Test]: 'bg-accent-cheese-flat text-accent-cheese-default',
  [Tier.Support]: 'bg-surface-float text-text-tertiary',
  [Tier.Shipped]: 'bg-accent-cabbage-flat text-accent-cabbage-default',
};

export const TierBadge = ({ tier }: { tier: Tier }): ReactElement => (
  <span
    className={classNames(
      'rounded-8 px-2 py-0.5 font-bold typo-caption1',
      tierClass[tier],
    )}
  >
    {tier}
  </span>
);

export type IdeaFacts = {
  /** When the ask happens. */
  moment: string;
  /** Where it renders in the code. */
  surface: string;
  /** The browser rule it lives with. */
  rule: string;
  build: 'S' | 'M' | 'L';
  /** The `origin` it passes to requestContentScripts. */
  origin: string;
};

const buildLabel = { S: 'Small', M: 'Medium', L: 'Large' } as const;

/** One idea: the pitch, the drawing and the facts an engineer needs. */
export const Idea = ({
  id,
  n,
  title,
  tier,
  pitch,
  facts,
  open,
  children,
}: {
  id: string;
  n: number;
  title: string;
  tier: Tier;
  pitch: ReactNode;
  facts: IdeaFacts;
  /** What still has to be answered before it ships. */
  open?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <article
    id={id}
    className="flex scroll-mt-6 flex-col gap-5 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6"
  >
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-8 bg-surface-float font-bold typo-footnote">
          {n}
        </span>
        <TierBadge tier={tier} />
        <span className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
          Build: {buildLabel[facts.build]}
        </span>
      </div>
      <h3 className="text-balance font-bold typo-title3">{title}</h3>
      <p className="max-w-[85ch] text-pretty text-text-secondary typo-callout">
        {pitch}
      </p>
    </header>
    <div className="flex flex-col gap-4">{children}</div>
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 border-t border-border-subtlest-tertiary pt-4 tablet:grid-cols-2 laptop:grid-cols-4">
      {(
        [
          ['When', facts.moment],
          ['Where in the code', facts.surface],
          ['Browser rule', facts.rule],
          ['Log origin', facts.origin],
        ] as const
      ).map(([label, value]) => (
        <div key={label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="font-bold text-text-quaternary typo-caption1">
            {label}
          </dt>
          <dd
            className={classNames(
              'min-w-0 text-pretty text-text-secondary typo-footnote',
              label === 'Log origin' && 'font-mono',
            )}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
    {open && (
      <p className="rounded-12 bg-surface-float px-4 py-3 text-text-tertiary typo-footnote">
        <span className="font-bold text-text-secondary">Open question: </span>
        {open}
      </p>
    )}
  </article>
);

/** Variants of one idea, side by side. */
export const Variants = ({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3;
}): ReactElement => (
  <div
    className={classNames(
      'grid grid-cols-1 items-start gap-4',
      cols === 2 && 'laptop:grid-cols-2',
      cols === 3 && 'laptop:grid-cols-3',
    )}
  >
    {children}
  </div>
);

export const Variant = ({
  label,
  note,
  children,
}: {
  label: string;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2">
    <figcaption className="flex flex-col gap-0.5">
      <span className="font-bold text-text-tertiary typo-caption1">
        {label}
      </span>
      {note && (
        <span className="text-pretty text-text-quaternary typo-caption1">
          {note}
        </span>
      )}
    </figcaption>
    {children}
  </figure>
);

// --- The permission round trip ---------------------------------------------

export type PermissionState = 'idle' | 'asking' | 'granted' | 'declined';

export type Permission = {
  state: PermissionState;
  ask: () => void;
  allow: () => void;
  deny: () => void;
  reset: () => void;
};

/** Every Activate button in the page walks the same steps the browser does. */
export const usePermission = (): Permission => {
  const [state, setState] = useState<PermissionState>('idle');
  return {
    state,
    ask: () => setState('asking'),
    allow: () => setState('granted'),
    deny: () => setState('declined'),
    reset: () => setState('idle'),
  };
};

/**
 * Chrome's own dialog for `permissions.request({ origins: ['*://*\/*'] })`,
 * approximated. This is the real cost of every idea on this page: whatever
 * we draw, the member ends on this sentence, so the ask before it has to
 * have already explained why.
 */
export const BrowserPermissionDialog = ({
  permission,
  className,
}: {
  permission: Permission;
  className?: string;
}): ReactElement | null => {
  if (permission.state !== 'asking') {
    return null;
  }
  return (
    <div
      role="dialog"
      aria-label="Browser permission request"
      className={classNames(
        'absolute left-1/2 top-3 z-3 w-80 -translate-x-1/2 rounded-12 border border-border-subtlest-secondary bg-background-popover p-4 shadow-2',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <LogoIcon className={{ container: 'w-5 rounded-4' }} />
        <span className="min-w-0 flex-1 font-bold typo-footnote">
          “daily.dev” requests additional permissions:
        </span>
      </div>
      <p className="mt-3 text-text-secondary typo-footnote">It could:</p>
      <p className="mt-1 text-text-primary typo-footnote">
        • Read and change all your data on all websites
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Float}
          onClick={permission.deny}
        >
          Deny
        </Button>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
          onClick={permission.allow}
        >
          Allow
        </Button>
      </div>
      <p className="mt-3 text-text-quaternary typo-caption2">
        Approximation of the browser’s dialog. Its wording cannot be changed.
      </p>
    </div>
  );
};

/** The Activate button and what it turns into. */
export const ActivateButton = ({
  permission,
  label = 'Enable companion',
  size = ButtonSize.Small,
  variant = ButtonVariant.Primary,
  className,
}: {
  permission: Permission;
  label?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
}): ReactElement => {
  if (permission.state === 'granted') {
    return (
      <span
        className={classNames(
          'flex items-center gap-1 font-bold text-accent-avocado-default typo-footnote',
          className,
        )}
      >
        <VIcon size={IconSize.Small} /> Companion on
        <button
          type="button"
          onClick={permission.reset}
          className="ml-2 font-normal text-text-quaternary underline typo-caption1"
        >
          reset
        </button>
      </span>
    );
  }
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={permission.ask}
      loading={permission.state === 'asking'}
    >
      {permission.state === 'declined' ? 'Try again' : label}
    </Button>
  );
};

// --- Frames -----------------------------------------------------------------

/** A browser window around an article page. */
export const BrowserWindow = ({
  url,
  children,
  className,
  height = 360,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  height?: number;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2',
      className,
    )}
  >
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-surface-float px-3">
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-accent-ketchup-default" />
        <span className="size-2.5 rounded-full bg-accent-cheese-default" />
        <span className="size-2.5 rounded-full bg-accent-avocado-default" />
      </span>
      <ArrowIcon
        size={IconSize.Small}
        className="-rotate-90 text-text-quaternary"
      />
      <RefreshIcon size={IconSize.Small} className="text-text-quaternary" />
      <span className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-8 bg-background-default px-2 text-text-tertiary typo-caption1">
        <LockIcon size={IconSize.XSmall} />
        <span className="truncate">{url}</span>
      </span>
      <LogoIcon className={{ container: 'w-5 rounded-4' }} />
    </div>
    <div className="relative flex-1 overflow-hidden" style={{ height }}>
      {children}
    </div>
  </div>
);

const Line = ({ w, className }: { w: string; className?: string }) => (
  <span
    className={classNames('block h-2.5 rounded-4 bg-surface-float', className)}
    style={{ width: w }}
  />
);

/** A third-party article, as the companion would sit on it. */
export const ArticleMock = ({
  title = 'Why your React app re-renders more than you think',
  children,
}: {
  title?: string;
  children?: ReactNode;
}): ReactElement => (
  <div className="relative h-full overflow-hidden bg-background-default">
    <div className="mx-auto flex max-w-[34rem] flex-col gap-3 px-8 py-6">
      <span className="text-text-quaternary typo-caption1">
        frontendweekly.dev · 7 min read
      </span>
      <h4 className="text-balance font-bold typo-title3">{title}</h4>
      <div className="h-24 rounded-12 bg-surface-float" />
      {['100%', '94%', '98%', '60%', '100%', '88%', '72%'].map((w, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Line key={i} w={w} />
      ))}
    </div>
    {children}
  </div>
);

const pillButton =
  'flex size-9 items-center justify-center rounded-10 text-text-tertiary hover:bg-surface-float hover:text-text-primary';

/** The companion's side pill, as CompanionMenu draws it. */
export const CompanionPill = ({
  open = false,
  ghost = false,
  className,
}: {
  open?: boolean;
  /** Drawn as a preview of what the member would get. */
  ghost?: boolean;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'absolute right-0 top-6 flex flex-row items-start',
      ghost && 'opacity-50',
      className,
    )}
  >
    {open && (
      <div className="mt-2 flex w-64 flex-col gap-2 rounded-l-16 border border-r-0 border-border-subtlest-quaternary bg-background-default p-4 shadow-2">
        <div className="flex items-center gap-2">
          <LogoIcon className={{ container: 'w-6 rounded-6' }} />
          <span className="text-text-quaternary typo-caption1">
            daily.dev companion
          </span>
        </div>
        <p className="text-text-secondary typo-caption1">
          <TLDRText>TLDR -</TLDRText>React re-renders a component whenever its
          parent does; memo and stable props are what stop it.
        </p>
        <span className="text-text-quaternary typo-caption2">
          142 upvotes · 38 comments
        </span>
      </div>
    )}
    <div className="flex w-12 flex-col items-center gap-1 rounded-l-16 border border-r-0 border-border-subtlest-quaternary bg-background-default p-1.5 shadow-2">
      <span className={pillButton}>
        <LogoIcon className={{ container: 'w-5 rounded-4' }} />
      </span>
      <span className={pillButton}>
        <UpvoteIcon size={IconSize.Small} />
      </span>
      <span className={pillButton}>
        <DiscussIcon size={IconSize.Small} />
      </span>
      <span className={pillButton}>
        <BookmarkIcon size={IconSize.Small} />
      </span>
      <span className={pillButton}>
        <ShareIcon size={IconSize.Small} />
      </span>
      <span className={pillButton}>
        <MenuIcon size={IconSize.Small} />
      </span>
    </div>
  </div>
);

export const railButtonClass =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary hover:bg-surface-hover hover:text-text-primary';

/** A feed card placeholder, with an optional Read action. */
export const FeedCardMock = ({
  title,
  onRead,
  tone = 'bg-surface-float',
}: {
  title: string;
  onRead?: () => void;
  tone?: string;
}): ReactElement => (
  <div className="flex min-w-0 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3">
    <span className="flex items-center gap-1.5">
      <span className="size-5 rounded-full bg-surface-float" />
      <Line w="40%" className="h-2" />
    </span>
    <span className="line-clamp-2 font-bold typo-footnote">{title}</span>
    <span className={classNames('h-20 rounded-10', tone)} />
    <span className="flex items-center justify-between text-text-quaternary">
      <span className="flex gap-2">
        <UpvoteIcon size={IconSize.Small} />
        <DiscussIcon size={IconSize.Small} />
        <BookmarkIcon size={IconSize.Small} />
      </span>
      {onRead && (
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Float}
          onClick={onRead}
        >
          Read
        </Button>
      )}
    </span>
  </div>
);

export const feedTitles = [
  'Why your React app re-renders more than you think',
  'Postgres 18 ships async I/O',
  'The hidden cost of microservices',
  'Rust in the Linux kernel, one year on',
  'Bun 2.0: what changed',
  'A practical guide to WebGPU',
];

/**
 * The extension new tab on layout v2, reduced to its slots: the rail, the
 * top-hero row above the card, the feed header and the grid.
 */
export const NewTabMock = ({
  top,
  headerRight,
  railExtra,
  overlay,
  cards = 3,
  onRead,
  height = 420,
  className,
}: {
  top?: ReactNode;
  headerRight?: ReactNode;
  railExtra?: ReactNode;
  overlay?: ReactNode;
  cards?: number;
  onRead?: (title: string) => void;
  height?: number;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default',
      className,
    )}
    style={{ minHeight: height }}
  >
    <nav className="flex w-16 shrink-0 flex-col items-center gap-2 py-3">
      <LogoIcon className={{ container: 'w-7 rounded-8' }} />
      <span className="mt-2 flex size-10 items-center justify-center rounded-12 bg-accent-cabbage-default text-text-primary">
        <NewPostIcon size={IconSize.Small} />
      </span>
      <span className={railButtonClass}>
        <HomeIcon size={IconSize.Small} />
      </span>
      <span className={railButtonClass}>
        <HashtagIcon size={IconSize.Small} />
      </span>
      <span className={railButtonClass}>
        <SquadIcon size={IconSize.Small} />
      </span>
      <div className="mt-auto flex flex-col items-center gap-1 border-t border-border-subtlest-tertiary pt-2">
        {railExtra}
        <span className={railButtonClass}>
          <HelpIcon size={IconSize.Small} />
        </span>
        <span className={railButtonClass}>
          <SettingsIcon size={IconSize.Small} />
        </span>
      </div>
    </nav>
    <div className="flex min-w-0 flex-1 flex-col gap-3 py-3 pr-3">
      {top}
      <div className="flex flex-1 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
        <div className="flex h-8 items-center gap-2">
          <span className="font-bold typo-callout">My feed</span>
          <span className="text-text-quaternary typo-footnote">
            Recommended
          </span>
          <div className="ml-auto flex items-center gap-1">{headerRight}</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 tablet:grid-cols-3">
          {feedTitles.slice(0, cards).map((title) => (
            <FeedCardMock
              key={title}
              title={title}
              onRead={onRead ? () => onRead(title) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
    {overlay}
  </div>
);

/** The dimmed backdrop a modal sits on, inside a frame. */
export const Scrim = ({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}): ReactElement => (
  <div className="absolute inset-0 z-2 flex items-center justify-center p-4">
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      className="absolute inset-0 cursor-default"
      style={{ background: 'rgba(14, 18, 23, 0.72)' }}
    />
    <div className="relative">{children}</div>
  </div>
);

/**
 * A small article with the companion on it: what the member is saying yes
 * to. The article is drawn at full size and scaled, so it reads as a page.
 */
export const CompanionPreview = ({
  height = 150,
  title,
}: {
  height?: number;
  title?: string;
}): ReactElement => (
  <div
    className="relative w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary"
    style={{ height }}
  >
    <div
      className="absolute left-0 top-0"
      style={{
        width: `${100 / 0.55}%`,
        height: height / 0.55,
        transform: 'scale(0.55)',
        transformOrigin: 'top left',
      }}
    >
      <ArticleMock title={title}>
        <CompanionPill open />
      </ArticleMock>
    </div>
  </div>
);

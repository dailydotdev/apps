import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  AlertIcon,
  ArrowIcon,
  FeatherIcon,
  LinkIcon,
  MailIcon,
  MicrophoneIcon,
  OpenLinkIcon,
  ShieldCheckIcon,
  SitesIcon,
  SparkleIcon,
  VIcon,
  YoutubeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import ExtensionProviders from '../extension/_providers';
import type { Source } from './data';
import { publications } from './data';
import {
  SourceLogo,
  SourcesProvider,
  SourcesStyles,
  ToastHost,
  formatCount,
  useSources,
} from './kit';
import type { Feed, SuggestFlow, SuggestStep } from './suggestFlow';
import { useSuggestFlow } from './suggestFlow';

// Six directions for "Suggest new source", past production's form-in-a-modal.
// Every one runs the same mocked scrape (suggestFlow.ts), so each can be
// tried end to end: paste a site for its feeds, a known source's site
// (css-tricks.com) for "already here", or a link with "fail" in it for the
// error. Each shows twice: as it opens, and mid-flow.

/* ---------------------------------------------------------------- bits */

const hostOf = (url: string): string =>
  url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0];

const nameOf = (url: string): string => {
  const base = hostOf(url).replace(/\.[a-z]+$/, '');
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
};

const handleOf = (url: string): string =>
  hostOf(url)
    .replace(/\.[a-z]+$/, '')
    .replace(/[^a-z0-9]/g, '');

const byFollowers = [...publications].sort((a, b) => b.followers - a.followers);
const topSources = byFollowers.slice(0, 5);
const backdropSources = byFollowers.slice(0, 11);

/** A site with no logo yet: its initial on an accent. */
const Monogram = ({
  url,
  className,
}: {
  url: string;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center bg-accent-cabbage-default font-bold text-white',
      className ?? 'size-8 rounded-10 typo-callout',
    )}
  >
    {nameOf(url).charAt(0) || <SitesIcon size={IconSize.Large} />}
  </span>
);

const Shimmer = ({ className }: { className?: string }): ReactElement => (
  <span
    className={classNames(
      'block animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

const Field = ({
  flow,
  placeholder = 'https://',
  className,
  inputClassName,
  leading,
  trailing,
  autoFocus,
}: {
  flow: SuggestFlow;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  autoFocus?: boolean;
}): ReactElement => (
  <form
    className={classNames('flex items-center', className)}
    onSubmit={(event) => {
      event.preventDefault();
      flow.check();
    }}
  >
    {leading}
    <input
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      aria-label="Source link"
      value={flow.url}
      onChange={(event) => flow.setUrl(event.target.value)}
      placeholder={placeholder}
      disabled={flow.step === 'submitting' || flow.step === 'done'}
      className={classNames(
        'min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-quaternary',
        inputClassName,
      )}
    />
    {trailing}
  </form>
);

/** A feed to pick: a card with a check that fills when picked. */
const FeedOption = ({
  feed,
  selected,
  onSelect,
  compact,
}: {
  feed: Feed;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}): ReactElement => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={classNames(
      'flex w-full items-center gap-3 rounded-14 border text-left transition-colors',
      compact ? 'px-2.5 py-2' : 'px-3 py-2.5',
      selected
        ? 'border-accent-cabbage-default bg-surface-float'
        : 'border-border-subtlest-tertiary hover:bg-surface-hover',
    )}
  >
    <Monogram
      url={feed.url}
      className={
        compact ? 'size-6 rounded-8 typo-caption1' : 'size-8 rounded-10'
      }
    />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold typo-callout">{feed.title}</span>
      <span className="truncate font-mono text-text-tertiary typo-caption1">
        {feed.url.replace(/^https?:\/\//, '')}
      </span>
    </span>
    <span
      className={classNames(
        'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
        selected
          ? 'border-accent-cabbage-default bg-accent-cabbage-default text-white'
          : 'border-border-subtlest-secondary',
      )}
    >
      {selected && <VIcon size={IconSize.XXSmall} />}
    </span>
  </button>
);

const ExistingCard = ({
  source,
  action = true,
}: {
  source: Source;
  action?: boolean;
}): ReactElement => {
  const { goTo } = useSources();
  return (
    <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
      <SourceLogo source={source} className="size-10 rounded-full" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-callout">{source.name}</span>
        <span className="truncate text-text-tertiary typo-footnote">
          Already on daily.dev · {formatCount(source.followers)} followers
        </span>
      </span>
      {action && (
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Float}
          onClick={() => goTo(`/sources/${source.handle}`)}
        >
          Open
        </Button>
      )}
    </div>
  );
};

const ErrorNote = ({ url }: { url: string }): ReactElement => {
  const { notify } = useSources();
  return (
    <div className="flex items-start gap-3 rounded-16 bg-surface-float p-3">
      <AlertIcon
        size={IconSize.Small}
        className="mt-0.5 shrink-0 text-accent-ketchup-default"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold typo-callout">
          No feed found on {hostOf(url) || 'that link'}
        </span>
        <span className="text-text-tertiary typo-footnote">
          Try the feed’s own link, often ending in /feed or /rss.
        </span>
      </span>
      <Button
        type="button"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Float}
        className="shrink-0"
        onClick={() => notify('Opens an email to hi@daily.dev')}
      >
        Contact
      </Button>
    </div>
  );
};

const Feeds = ({
  flow,
  compact,
}: {
  flow: SuggestFlow;
  compact?: boolean;
}): ReactElement => (
  <div role="radiogroup" aria-label="Feeds" className="flex flex-col gap-2">
    {flow.feeds.map((feed) => (
      <FeedOption
        key={feed.url}
        feed={feed}
        compact={compact}
        selected={flow.selected === feed.url}
        onSelect={() => flow.select(feed.url)}
      />
    ))}
  </div>
);

const isPicking = (step: SuggestStep): boolean =>
  step === 'feeds' || step === 'submitting';

/* ------------------------------------------------------- 1 command bar */

const fits = [
  { Icon: FeatherIcon, text: 'Technical writing for developers' },
  { Icon: SitesIcon, text: 'A public RSS or Atom feed' },
  { Icon: ShieldCheckIcon, text: 'Within the content guidelines' },
];

// Spotlight's language: no title, no form chrome, the link is the whole
// header. Results stream in under it; the footer holds the hints and the
// one action that matters next.
const CommandBar = ({ flow }: { flow: SuggestFlow }): ReactElement => {
  const host = hostOf(flow.url);
  return (
    <div className="w-[36rem] max-w-full overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-popover shadow-3">
      <Field
        flow={flow}
        placeholder="Paste a blog, newsletter or channel link"
        className="h-16 gap-3 px-5"
        inputClassName="typo-title3"
        leading={
          <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-secondary">
            <LinkIcon size={IconSize.Small} />
          </span>
        }
        trailing={
          flow.step === 'checking' ? (
            <Loader />
          ) : (
            <Button
              type="submit"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              disabled={!flow.canCheck || flow.step === 'done'}
            >
              Check
            </Button>
          )
        }
      />
      <div className="flex min-h-[13.5rem] flex-col gap-2 border-t border-border-subtlest-tertiary p-4">
        {flow.step === 'idle' && (
          <>
            <span className="px-1 font-bold text-text-quaternary typo-caption1">
              WHAT FITS
            </span>
            {fits.map(({ Icon, text }) => (
              <span
                key={text}
                className="flex h-10 items-center gap-3 rounded-12 px-2 text-text-secondary typo-callout"
              >
                <Icon size={IconSize.Small} className="text-text-tertiary" />
                {text}
              </span>
            ))}
          </>
        )}
        {flow.step === 'checking' && (
          <>
            <span className="px-1 text-text-tertiary typo-footnote">
              Looking for feeds on {host}…
            </span>
            {[0, 1].map((row) => (
              <span key={row} className="flex items-center gap-3 px-3 py-2.5">
                <Shimmer className="size-8 rounded-10" />
                <span className="flex flex-1 flex-col gap-1.5">
                  <Shimmer className="h-3 w-1/3" />
                  <Shimmer className="h-2.5 w-2/3" />
                </span>
              </span>
            ))}
          </>
        )}
        {isPicking(flow.step) && (
          <>
            <span className="px-1 text-text-tertiary typo-footnote">
              {flow.feeds.length} feed{flow.feeds.length > 1 ? 's' : ''} on{' '}
              {host}
            </span>
            <Feeds flow={flow} />
          </>
        )}
        {flow.step === 'exists' && flow.existing && (
          <ExistingCard source={flow.existing} />
        )}
        {flow.step === 'error' && <ErrorNote url={flow.url} />}
        {flow.step === 'done' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-avocado-default text-white">
              <VIcon size={IconSize.Medium} />
            </span>
            <span className="font-bold typo-title3">Sent for review</span>
            <span className="text-text-tertiary typo-callout">
              We’ll let you know when {nameOf(flow.url)} joins the feed.
            </span>
          </div>
        )}
      </div>
      <footer className="flex h-12 items-center justify-between gap-2 border-t border-border-subtlest-tertiary bg-background-subtle pl-5 pr-2 text-text-quaternary typo-caption1">
        <span className="flex gap-4">
          <span>
            <kbd className="font-mono">↵</kbd> check
          </span>
          <span>
            <kbd className="font-mono">esc</kbd> close
          </span>
        </span>
        {isPicking(flow.step) && (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            disabled={!flow.selected}
            loading={flow.step === 'submitting'}
            onClick={flow.submit}
          >
            Submit for review
          </Button>
        )}
        {flow.step === 'done' && (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            onClick={flow.reset}
          >
            Suggest another
          </Button>
        )}
      </footer>
    </div>
  );
};

/* ------------------------------------------------------ 2 live preview */

// The reward up front: a tile of the source, the way it will sit in the
// directory, draws itself as the link is typed.
const LivePreview = ({ flow }: { flow: SuggestFlow }): ReactElement => {
  const { closeSuggest } = useSources();
  const hasLink = !!hostOf(flow.url);
  let status = { label: 'Paste a link to preview', tone: 'quiet' };
  if (flow.step === 'checking') {
    status = { label: 'Checking…', tone: 'quiet' };
  } else if (isPicking(flow.step)) {
    status = { label: 'Ready to submit', tone: 'good' };
  } else if (flow.step === 'exists') {
    status = { label: 'Already on daily.dev', tone: 'warn' };
  } else if (flow.step === 'error') {
    status = { label: 'No feed found', tone: 'warn' };
  } else if (flow.step === 'done') {
    status = { label: 'In review', tone: 'good' };
  } else if (hasLink) {
    status = { label: 'Preview', tone: 'quiet' };
  }

  return (
    <div className="grid w-[48rem] max-w-full grid-cols-1 overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-popover shadow-3 tablet:grid-cols-[1fr_16rem]">
      <div className="flex min-w-0 flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold typo-title2">Suggest a source</h2>
            <p className="text-text-tertiary typo-callout">
              Paste its site. We find the feed.
            </p>
          </div>
          <CloseButton
            size={ButtonSize.Small}
            className="-mr-2 -mt-1"
            onClick={closeSuggest}
          />
        </div>
        <Field
          flow={flow}
          placeholder="https://yourfavorite.blog"
          className="h-12 gap-2 rounded-14 border border-border-subtlest-secondary bg-surface-float px-3 focus-within:border-accent-cabbage-default"
          inputClassName="typo-body"
          leading={
            <LinkIcon size={IconSize.Small} className="text-text-tertiary" />
          }
          trailing={flow.step === 'checking' && <Loader />}
        />
        {isPicking(flow.step) && <Feeds flow={flow} />}
        {flow.step === 'exists' && flow.existing && (
          <ExistingCard source={flow.existing} />
        )}
        {flow.step === 'error' && <ErrorNote url={flow.url} />}
        <div className="mt-auto flex items-center justify-end gap-2">
          {flow.step === 'done' ? (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              onClick={flow.reset}
            >
              Suggest another
            </Button>
          ) : (
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              disabled={isPicking(flow.step) ? !flow.selected : !flow.canCheck}
              loading={flow.step === 'checking' || flow.step === 'submitting'}
              onClick={isPicking(flow.step) ? flow.submit : flow.check}
            >
              {isPicking(flow.step) ? 'Submit for review' : 'Find feed'}
            </Button>
          )}
        </div>
      </div>
      <aside className="relative hidden flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-b from-accent-cabbage-subtler to-transparent p-6 tablet:flex">
        <span className="font-bold text-text-tertiary typo-caption1">
          HOW IT WILL LOOK
        </span>
        <div className="flex w-44 flex-col items-center gap-2 rounded-20 border border-border-subtlest-tertiary bg-background-default p-4 text-center shadow-2">
          {flow.existing ? (
            <SourceLogo source={flow.existing} className="size-16 rounded-20" />
          ) : (
            <Monogram
              url={flow.url}
              className={classNames(
                'size-16 rounded-20 typo-title1 transition-opacity',
                !hasLink && 'opacity-30',
              )}
            />
          )}
          <span className="flex w-full min-w-0 flex-col">
            {hasLink ? (
              <>
                <span className="truncate font-bold typo-callout">
                  {flow.existing?.name ?? nameOf(flow.url)}
                </span>
                <span className="truncate text-text-quaternary typo-caption1">
                  @{flow.existing?.handle ?? handleOf(flow.url)}
                </span>
              </>
            ) : (
              <span className="flex flex-col items-center gap-1.5 py-1">
                <Shimmer className="h-3 w-24 animate-none" />
                <Shimmer className="h-2.5 w-16 animate-none" />
              </span>
            )}
          </span>
          <span
            className={classNames(
              'rounded-8 px-2 py-0.5 font-bold typo-caption1',
              status.tone === 'good' && 'bg-accent-avocado-default text-white',
              status.tone === 'warn' &&
                'bg-surface-float text-accent-cheese-default',
              status.tone === 'quiet' && 'bg-surface-float text-text-tertiary',
            )}
          >
            {status.label}
          </span>
        </div>
      </aside>
    </div>
  );
};

/* ----------------------------------------------------------- 3 stepper */

// Three beats, one at a time: Link, Feed, Review. A big glyph names the
// beat, the progress bar says how far, one wide button moves on.
const steps = ['Link', 'Feed', 'Review'];

const Stepper = ({ flow }: { flow: SuggestFlow }): ReactElement => {
  const { closeSuggest } = useSources();
  let at = 0;
  if (isPicking(flow.step)) {
    at = 1;
  } else if (flow.step === 'done') {
    at = 2;
  }
  const glyph = [
    <LinkIcon key="link" size={IconSize.XLarge} />,
    <SitesIcon key="feed" size={IconSize.XLarge} />,
    <VIcon key="done" size={IconSize.XLarge} />,
  ][at];
  const copy = [
    {
      title: 'Where does it publish?',
      body: 'A blog, a newsletter or a channel: paste its home page.',
    },
    {
      title: 'Pick the feed',
      body: `We found ${flow.feeds.length} on ${hostOf(flow.url)}.`,
    },
    {
      title: 'Sent for review',
      body: `We’ll let you know when ${nameOf(flow.url)} joins the feed.`,
    },
  ][at];

  return (
    <div className="flex w-[30rem] max-w-full flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-popover shadow-3">
      <header className="flex items-center gap-3 px-5 pt-5">
        <div className="flex flex-1 gap-1.5">
          {steps.map((label, index) => (
            <span key={label} className="flex flex-1 flex-col gap-1.5">
              <span
                className={classNames(
                  'h-1 rounded-full transition-colors duration-300',
                  index <= at
                    ? 'bg-accent-cabbage-default'
                    : 'bg-surface-float',
                )}
              />
              <span
                className={classNames(
                  'font-bold typo-caption1',
                  index === at ? 'text-text-primary' : 'text-text-quaternary',
                )}
              >
                {index + 1}. {label}
              </span>
            </span>
          ))}
        </div>
        <CloseButton size={ButtonSize.Small} onClick={closeSuggest} />
      </header>
      <div className="flex flex-col items-center gap-3 px-6 pb-2 pt-8 text-center">
        <span
          key={at}
          className={classNames(
            'sx-in flex size-20 items-center justify-center rounded-26',
            at === 2
              ? 'bg-accent-avocado-default text-white'
              : 'bg-surface-float text-accent-cabbage-default',
          )}
        >
          {glyph}
        </span>
        <h2 className="font-bold typo-title2">{copy.title}</h2>
        <p className="max-w-[32ch] text-text-tertiary typo-callout">
          {copy.body}
        </p>
      </div>
      <div className="flex flex-col gap-3 p-6">
        {at === 0 && (
          <Field
            flow={flow}
            placeholder="https://"
            className="h-12 gap-2 rounded-14 bg-surface-float px-4 ring-accent-cabbage-default focus-within:ring-2"
            inputClassName="typo-body"
            trailing={flow.step === 'checking' && <Loader />}
          />
        )}
        {at === 1 && <Feeds flow={flow} />}
        {flow.step === 'exists' && flow.existing && (
          <ExistingCard source={flow.existing} />
        )}
        {flow.step === 'error' && <ErrorNote url={flow.url} />}
        {at === 0 && (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            disabled={!flow.canCheck}
            loading={flow.step === 'checking'}
            onClick={flow.check}
            className="w-full"
          >
            Continue
          </Button>
        )}
        {at === 1 && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Float}
              icon={<ArrowIcon className="-rotate-90" />}
              aria-label="Back"
              onClick={flow.back}
            />
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              disabled={!flow.selected}
              loading={flow.step === 'submitting'}
              onClick={flow.submit}
              className="flex-1"
            >
              Submit for review
            </Button>
          </div>
        )}
        {at === 2 && (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            onClick={flow.reset}
            className="w-full"
          >
            Suggest another
          </Button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------- 4 gradient hero */

// An invitation more than a form: the band of sources developers already
// follow most, and one pill field under it, like a search engine's.
const GradientHero = ({ flow }: { flow: SuggestFlow }): ReactElement => {
  const { closeSuggest } = useSources();
  const isDone = flow.step === 'done';
  return (
    <div className="w-[32rem] max-w-full overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-popover shadow-3">
      <div className="relative h-36 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default">
        <span className="absolute right-3 top-3">
          <CloseButton
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            onClick={closeSuggest}
          />
        </span>
        <div className="absolute inset-x-0 -bottom-8 flex justify-center">
          {isDone ? (
            <span className="sx-in flex size-16 items-center justify-center rounded-full bg-accent-avocado-default text-white ring-4 ring-background-popover">
              <VIcon size={IconSize.Large} />
            </span>
          ) : (
            <span className="flex">
              {topSources.map((source, index) => (
                <SourceLogo
                  key={source.id}
                  source={source}
                  className={classNames(
                    'size-14 rounded-18 ring-4 ring-background-popover',
                    index > 0 && '-ml-3',
                    index % 2 ? 'rotate-6' : '-rotate-6',
                    index === 2 && 'z-1 -translate-y-1 rotate-0 scale-110',
                  )}
                />
              ))}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 px-8 pb-8 pt-12 text-center">
        <h2 className="font-bold typo-title2">
          {isDone ? 'You’re on the list' : 'Know a source we’re missing?'}
        </h2>
        <p className="max-w-[36ch] text-text-tertiary typo-callout">
          {isDone
            ? `We’ll let you know when ${nameOf(flow.url)} joins the feed.`
            : 'Help developers find their next favorite read.'}
        </p>
        {!isDone && (
          <Field
            flow={flow}
            placeholder="Paste a link"
            className="mt-4 h-12 w-full gap-2 rounded-max border border-border-subtlest-secondary bg-surface-float pl-4 pr-1.5 focus-within:border-accent-cabbage-default"
            inputClassName="typo-callout"
            leading={
              <LinkIcon size={IconSize.Small} className="text-text-tertiary" />
            }
            trailing={
              !isPicking(flow.step) && (
                <Button
                  type="submit"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Primary}
                  className="!rounded-max"
                  disabled={!flow.canCheck}
                  loading={flow.step === 'checking'}
                >
                  Check
                </Button>
              )
            }
          />
        )}
        <div className="flex w-full flex-col gap-2 pt-2 text-left">
          {isPicking(flow.step) && (
            <>
              <Feeds flow={flow} />
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                className="mt-2 w-full"
                disabled={!flow.selected}
                loading={flow.step === 'submitting'}
                onClick={flow.submit}
              >
                Submit for review
              </Button>
            </>
          )}
          {flow.step === 'exists' && flow.existing && (
            <ExistingCard source={flow.existing} />
          )}
          {flow.step === 'error' && <ErrorNote url={flow.url} />}
          {isDone && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              className="mt-2 w-full"
              onClick={flow.reset}
            >
              Suggest another
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------- 5 kinds and timeline */

// Says what it takes and what happens: pick the kind (the field's hint
// follows), paste, and a timeline that lights up as the request moves.
const kinds = [
  {
    id: 'blog',
    label: 'Blog',
    Icon: FeatherIcon,
    hint: 'https://yourblog.dev',
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    Icon: MailIcon,
    hint: 'https://weekly.newsletter.dev',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    Icon: YoutubeIcon,
    hint: 'https://youtube.com/@channel',
  },
  {
    id: 'podcast',
    label: 'Podcast',
    Icon: MicrophoneIcon,
    hint: 'https://podcast.dev/feed',
  },
];

const KindsTimeline = ({ flow }: { flow: SuggestFlow }): ReactElement => {
  const { closeSuggest } = useSources();
  const [kind, setKind] = useState(kinds[0].id);
  const current = kinds.find((item) => item.id === kind) ?? kinds[0];
  let lit = 0;
  if (flow.step === 'checking' || isPicking(flow.step)) {
    lit = 1;
  } else if (flow.step === 'done') {
    lit = 2;
  }
  const timeline = [
    {
      title: 'We find its feed',
      body: 'Paste the link and pick the feed we find.',
    },
    { title: 'Our team reviews it', body: 'Against the content guidelines.' },
    {
      title: 'It joins the feed',
      body: 'You get a notification when it’s live.',
    },
  ];

  return (
    <div className="flex w-[34rem] max-w-full flex-col gap-5 rounded-24 border border-border-subtlest-secondary bg-background-popover p-6 shadow-3">
      <header className="flex items-center justify-between">
        <h2 className="font-bold typo-title3">Suggest a source</h2>
        <CloseButton size={ButtonSize.Small} onClick={closeSuggest} />
      </header>
      <div className="grid grid-cols-4 gap-2" role="radiogroup">
        {kinds.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={item.id === kind}
            onClick={() => setKind(item.id)}
            className={classNames(
              'flex flex-col items-center gap-1.5 rounded-16 border py-3 font-bold typo-footnote transition-colors',
              item.id === kind
                ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
                : 'border-border-subtlest-tertiary text-text-tertiary hover:bg-surface-hover',
            )}
          >
            <item.Icon size={IconSize.Medium} secondary={item.id === kind} />
            {item.label}
          </button>
        ))}
      </div>
      <Field
        flow={flow}
        placeholder={current.hint}
        className="h-12 gap-2 rounded-14 border border-border-subtlest-secondary px-3 focus-within:border-accent-cabbage-default"
        inputClassName="typo-body"
        leading={
          <current.Icon size={IconSize.Small} className="text-text-tertiary" />
        }
        trailing={
          !isPicking(flow.step) &&
          flow.step !== 'done' && (
            <Button
              type="submit"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              disabled={!flow.canCheck}
              loading={flow.step === 'checking'}
            >
              Check
            </Button>
          )
        }
      />
      {isPicking(flow.step) && (
        <div className="flex flex-col gap-2">
          <Feeds flow={flow} />
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            className="self-end"
            disabled={!flow.selected}
            loading={flow.step === 'submitting'}
            onClick={flow.submit}
          >
            Submit for review
          </Button>
        </div>
      )}
      {flow.step === 'exists' && flow.existing && (
        <ExistingCard source={flow.existing} />
      )}
      {flow.step === 'error' && <ErrorNote url={flow.url} />}
      <ol className="flex flex-col rounded-16 bg-surface-float p-4">
        {timeline.map((item, index) => (
          <li key={item.title} className="flex gap-3">
            <span className="flex flex-col items-center">
              <span
                className={classNames(
                  'flex size-6 shrink-0 items-center justify-center rounded-full font-bold typo-caption1 transition-colors',
                  index < lit && 'bg-accent-avocado-default text-white',
                  index === lit && 'bg-accent-cabbage-default text-white',
                  index > lit &&
                    'border border-border-subtlest-secondary text-text-quaternary',
                )}
              >
                {index < lit ? <VIcon size={IconSize.XXSmall} /> : index + 1}
              </span>
              {index < timeline.length - 1 && (
                <span className="my-1 w-px flex-1 bg-border-subtlest-secondary" />
              )}
            </span>
            <span className="flex flex-col pb-3">
              <span
                className={classNames(
                  'font-bold typo-callout',
                  index > lit && 'text-text-tertiary',
                )}
              >
                {item.title}
              </span>
              <span className="text-text-tertiary typo-footnote">
                {item.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

/* -------------------------------------------------- 6 anchored popover */

// The lightest touch: a popover from the button itself, no backdrop, the
// field's trailing glyph turning spinner, check or warning as it goes.
const AnchoredPopover = ({ flow }: { flow: SuggestFlow }): ReactElement => {
  const { goTo } = useSources();
  let glyph: ReactNode = null;
  if (flow.step === 'checking') {
    glyph = <Loader className="!size-4" />;
  } else if (isPicking(flow.step)) {
    glyph = (
      <VIcon size={IconSize.Small} className="text-accent-avocado-default" />
    );
  } else if (flow.step === 'exists' || flow.step === 'error') {
    glyph = (
      <AlertIcon size={IconSize.Small} className="text-accent-cheese-default" />
    );
  }
  return (
    <div className="relative w-[22rem] max-w-full">
      <span
        aria-hidden
        className="absolute -top-1.5 right-10 size-3 rotate-45 border-l border-t border-border-subtlest-secondary bg-background-popover"
      />
      <div className="flex flex-col gap-3 rounded-20 border border-border-subtlest-secondary bg-background-popover p-4 shadow-3">
        {flow.step === 'done' ? (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-avocado-default text-white">
              <VIcon size={IconSize.Small} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold typo-callout">Sent for review</span>
              <span className="truncate text-text-tertiary typo-footnote">
                {nameOf(flow.url)} · we’ll let you know
              </span>
            </span>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Float}
              onClick={flow.reset}
            >
              Another
            </Button>
          </div>
        ) : (
          <>
            <span className="flex items-center gap-2">
              <SparkleIcon
                size={IconSize.Small}
                className="text-accent-cabbage-default"
              />
              <span className="font-bold typo-callout">Suggest a source</span>
            </span>
            <Field
              flow={flow}
              placeholder="Blog or RSS link"
              className="h-10 gap-2 rounded-12 bg-surface-float px-3"
              inputClassName="typo-callout"
              trailing={glyph}
            />
            {flow.step === 'exists' && flow.existing && (
              <span className="text-text-secondary typo-footnote">
                <strong>{flow.existing.name}</strong> is already on daily.dev.{' '}
                <button
                  type="button"
                  className="font-bold text-text-link"
                  onClick={() => goTo(`/sources/${flow.existing.handle}`)}
                >
                  Open it
                </button>
              </span>
            )}
            {flow.step === 'error' && (
              <span className="text-text-secondary typo-footnote">
                No feed there. Try the link ending in /feed or /rss.
              </span>
            )}
            {isPicking(flow.step) && <Feeds flow={flow} compact />}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => goTo('/content-guidelines')}
                className="flex items-center gap-1 text-text-tertiary typo-footnote hover:text-text-primary"
              >
                Guidelines
                <OpenLinkIcon size={IconSize.XSmall} />
              </button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                disabled={
                  isPicking(flow.step) ? !flow.selected : !flow.canCheck
                }
                loading={flow.step === 'checking' || flow.step === 'submitting'}
                onClick={isPicking(flow.step) ? flow.submit : flow.check}
              >
                {isPicking(flow.step) ? 'Submit' : 'Check'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- stages */

/** The hub, dimmed behind the popup: a few real rows under a scrim. */
const Backdrop = (): ReactElement => (
  <div aria-hidden className="absolute inset-0 flex flex-col gap-1 p-6">
    <span className="mb-3 h-5 w-32 rounded-8 bg-surface-float" />
    {backdropSources.map((source) => (
      <span key={source.id} className="flex items-center gap-3 py-1.5">
        <SourceLogo source={source} className="size-10 rounded-full" />
        <span className="flex flex-col gap-1">
          <span className="font-bold typo-callout">{source.name}</span>
          <span className="h-2.5 w-24 rounded-8 bg-surface-float" />
        </span>
      </span>
    ))}
  </div>
);

const Stage = ({
  label,
  anchored,
  children,
}: {
  label: string;
  /** The popover hangs from a Suggest button instead of floating centered. */
  anchored?: boolean;
  children: (close: () => void) => ReactNode;
}): ReactElement => {
  const [open, setOpen] = useState(true);
  const [run, setRun] = useState(0);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-bold text-text-tertiary typo-caption1">
        {label}
      </span>
      <SourcesProvider key={run} suggestOpen={open ? {} : null}>
        <StageBody
          anchored={anchored}
          open={open}
          onOpen={() => {
            setOpen(true);
            setRun((value) => value + 1);
          }}
          onClose={() => setOpen(false)}
        >
          {children}
        </StageBody>
      </SourcesProvider>
    </div>
  );
};

const StageBody = ({
  anchored,
  open,
  onOpen,
  onClose,
  children,
}: {
  anchored?: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}): ReactElement => {
  const { suggestOpen } = useSources();
  const isOpen = open && !!suggestOpen;
  return (
    <div className="relative h-[40rem] overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default [transform:translateZ(0)]">
      <Backdrop />
      <header className="absolute inset-x-0 top-0 flex h-14 items-center justify-end border-b border-border-subtlest-tertiary bg-background-default px-4">
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
          pressed={isOpen}
          onClick={onOpen}
        >
          Suggest a source
        </Button>
      </header>
      {isOpen && !anchored && (
        <div
          role="presentation"
          onClick={(event) => event.target === event.currentTarget && onClose()}
          className="absolute inset-0 flex items-center justify-center bg-overlay-quaternary-onion p-6 pt-20"
        >
          <div className="sx-in flex max-w-full justify-center">
            {children(onClose)}
          </div>
        </div>
      )}
      {isOpen && anchored && (
        <div
          role="presentation"
          onClick={(event) => event.target === event.currentTarget && onClose()}
          className="absolute inset-0 flex justify-end px-4 pt-[4.25rem]"
        >
          <div className="sx-in h-fit">{children(onClose)}</div>
        </div>
      )}
      <ToastHost />
    </div>
  );
};

/** One direction: its pitch and its two stages. */
const Variant = ({
  index,
  name,
  pitch,
  anchored,
  render,
  midFlow,
}: {
  index: number;
  name: string;
  pitch: string;
  anchored?: boolean;
  render: (flow: SuggestFlow) => ReactElement;
  midFlow: { url: string; step: SuggestStep; label: string };
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex items-baseline gap-3">
      <span className="font-bold text-accent-cabbage-default typo-title2">
        {String(index).padStart(2, '0')}
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-bold typo-title2">{name}</h2>
        <p className="max-w-[80ch] text-text-secondary typo-callout">{pitch}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 laptopL:grid-cols-2">
      <Stage label="Opened" anchored={anchored}>
        {() => <Flowing render={render} />}
      </Stage>
      <Stage label={midFlow.label} anchored={anchored}>
        {() => (
          <Flowing
            render={render}
            initialUrl={midFlow.url}
            initialStep={midFlow.step}
          />
        )}
      </Stage>
    </div>
  </section>
);

const Flowing = ({
  render,
  initialUrl,
  initialStep,
}: {
  render: (flow: SuggestFlow) => ReactElement;
  initialUrl?: string;
  initialStep?: SuggestStep;
}): ReactElement => {
  const flow = useSuggestFlow({ initialUrl, initialStep });
  return render(flow);
};

/* ---------------------------------------------------------------- page */

const feedsFound = {
  url: 'https://overreacted.io',
  step: 'feeds' as SuggestStep,
};

export const SuggestVariantsPage = (): ReactElement => (
  <ExtensionProviders>
    <SourcesStyles />
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[110rem] flex-col gap-16">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
            Sources redesign · suggest a source
          </span>
          <h1 className="font-bold typo-mega3">Six ways to suggest a source</h1>
          <p className="max-w-[80ch] text-text-secondary typo-body">
            Production’s “Suggest new source” is a form in a modal: a title bar,
            a text field, Check link, then radio buttons. These six keep its
            steps (paste, find the feed, pick it, submit for review) and its
            outcomes, and rethink how it feels. Every stage works: paste any
            site for its feeds, <code>css-tricks.com</code> for a source that’s
            already here, or a link with “fail” in it for the error. Close one
            and reopen it from its Suggest button.
          </p>
        </header>

        <Variant
          index={1}
          name="Command bar"
          pitch="Spotlight’s language. No title and no form chrome: the link is the header, results stream in under it with skeletons while it looks, and the footer keeps the keyboard hints and the one action that matters next."
          render={(flow) => <CommandBar flow={flow} />}
          midFlow={{ ...feedsFound, label: 'Feeds found' }}
        />
        <Variant
          index={2}
          name="Live preview"
          pitch="Shows the reward before the work: a tile of the source, as it will sit in the directory, draws itself while the link is typed, and its badge follows the request from Preview to In review."
          render={(flow) => <LivePreview flow={flow} />}
          midFlow={{
            url: 'https://css-tricks.com',
            step: 'exists',
            label: 'Already a source',
          }}
        />
        <Variant
          index={3}
          name="Stepper"
          pitch="One beat at a time, Link, Feed, Review, each with a big glyph and one wide button. The calmest of the six, and the one that reads best on a phone."
          render={(flow) => <Stepper flow={flow} />}
          midFlow={{ ...feedsFound, label: 'Step 2 · pick the feed' }}
        />
        <Variant
          index={4}
          name="Invitation"
          pitch="Less a form, more an ask: a gradient band of the sources developers follow most, a warm question, and one pill field like a search engine’s. Done swaps the logos for a check."
          render={(flow) => <GradientHero flow={flow} />}
          midFlow={{ ...feedsFound, step: 'done', label: 'Sent' }}
        />
        <Variant
          index={5}
          name="Kinds and timeline"
          pitch="Says what it takes and what happens next. Pick the kind (the hint follows), paste, and a three-step timeline lights up as the request moves from finding the feed to review to live."
          render={(flow) => <KindsTimeline flow={flow} />}
          midFlow={{
            url: 'https://fail.example.com',
            step: 'error',
            label: 'No feed found',
          }}
        />
        <Variant
          index={6}
          name="Anchored popover"
          anchored
          pitch="The lightest touch: a popover that hangs from the Suggest button, with no backdrop and the page still in view. The field’s trailing glyph turns spinner, check or warning as it goes."
          render={(flow) => <AnchoredPopover flow={flow} />}
          midFlow={{ ...feedsFound, label: 'Feeds found' }}
        />
      </div>
    </div>
  </ExtensionProviders>
);

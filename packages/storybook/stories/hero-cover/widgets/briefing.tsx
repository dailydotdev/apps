import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BriefGradientIcon } from '@dailydotdev/shared/src/components/icons/BriefGradient';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { realPosts, realHeroPosts } from '../realData';

/* ------------------------------------------------------------------ */
/* Data: written from the snapshot's real posts                        */
/* ------------------------------------------------------------------ */

const allPosts = [...realHeroPosts, ...realPosts];

const find = (fragment: string): Post => {
  const post = allPosts.find((item) => item.title?.includes(fragment));
  if (!post) {
    throw new Error(`No post in the snapshot matches "${fragment}"`);
  }
  return post;
};

export type BriefLine = {
  /** The sentence, in our voice, not the headline's. */
  text: string;
  why: string;
  sources: Post[];
  at: string;
};

export const briefing = {
  headline: 'Node had a big day, and TanStack shipped Charts 1.0.',
  window: 'Since your visit 14 hours ago',
  stats: 'From 214 posts in your feed · 4 min read',
  stack: [
    {
      text: 'Node.js 26.11.1 is out, and Booking.com says moving to Watt cut its Node bill by 38%.',
      why: '#nodejs',
      sources: [find('Node.js 26.11.1'), find('Booking.com')],
      at: '07:12',
    },
    {
      text: 'TanStack Charts reached 1.0, the same day a TanStack Router crash course landed.',
      why: '#react',
      sources: [find('TanStack Charts'), find('TanStack Router')],
      at: '09:40',
    },
    {
      text: '.NET shipped a lighter C# Dev Kit, and a team found an AI agent had pulled in a vulnerable NuGet package.',
      why: '#dotnet',
      sources: [find('C# Dev Kit'), find('vulnerable NuGet')],
      at: '11:05',
    },
    {
      text: 'Postgres got pg_plan_filter 1.0, and SqlClient’s new pool makes parallel connections faster.',
      why: '#postgres',
      sources: [find('pg_plan_filter'), find('SqlClient')],
      at: '13:30',
    },
    {
      text: 'Netflix explained how it taught an LLM to recommend, and why models lose the middle of your prompt.',
      why: '#ai',
      sources: [find('Netflix Taught'), find('LLM Blindspot')],
      at: '16:20',
    },
  ] as BriefLine[],
  around: [
    {
      text: 'Ido and 1 other replied to your comment on TanStack Charts',
      at: '2h',
    },
    {
      text: 'Frontend Avengers argued about the React compiler: 18 replies',
      at: '5h',
    },
    { text: 'Your post “Ship it on Friday” got 12 upvotes', at: '8h' },
    { text: 'Lee sent you a message', at: '9h' },
  ],
  worth: {
    text: 'The most discussed post in your network: “Software developers are not okay”.',
    source: find('not okay'),
  },
};

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

export const SourceChip = ({ post }: { post: Post }): ReactElement => (
  <a
    href="#"
    onClick={(event) => event.preventDefault()}
    title={post.title}
    className="inline-flex h-5 max-w-[10rem] items-center gap-1 rounded-6 bg-surface-float pl-0.5 pr-1.5 align-middle text-text-tertiary transition-colors typo-caption2 hover:bg-surface-hover hover:text-text-primary"
  >
    {post.source?.image && (
      <img
        src={post.source.image}
        alt=""
        className="size-4 rounded-4 object-cover"
      />
    )}
    <span className="truncate">{post.source?.name}</span>
  </a>
);

export const BriefLabel = ({
  children,
  compact,
}: {
  children: ReactNode;
  compact?: boolean;
}): ReactElement => (
  <span className="flex items-center gap-2">
    <BriefGradientIcon
      secondary
      size={compact ? IconSize.Size16 : IconSize.Small}
    />
    <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
      {children}
    </span>
  </span>
);

export const Actions = (): ReactElement => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      className="flex h-8 items-center gap-1.5 rounded-10 bg-text-primary px-3 font-bold text-surface-invert typo-footnote"
    >
      <PlayIcon size={IconSize.Size16} />
      Listen · 3 min
    </button>
    <button
      type="button"
      className="flex h-8 items-center rounded-10 px-3 font-bold text-text-secondary typo-footnote hover:bg-surface-hover"
    >
      Mark as caught up
    </button>
  </div>
);

export const AroundYou = ({ limit = 4 }: { limit?: number }): ReactElement => (
  <div className="flex flex-col gap-3">
    <span className="font-bold text-text-primary typo-callout">Around you</span>
    {briefing.around.slice(0, limit).map((item) => (
      <div key={item.text} className="flex items-start gap-2">
        <span className="mt-1.5 size-1.5 shrink-0 rounded-max bg-accent-cabbage-default" />
        <span className="min-w-0 flex-1 text-text-secondary typo-footnote">
          {item.text}
        </span>
        <span className="shrink-0 tabular-nums text-text-quaternary typo-caption1">
          {item.at}
        </span>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* H1 · Front page                                                     */
/* ------------------------------------------------------------------ */

/** A newspaper front page for one reader: the lead, the stack, the people. */
export const BriefFrontPage = (): ReactElement => (
  <section className="grid min-h-[27.5rem] grid-cols-5 gap-8 rounded-16 bg-background-subtle p-6">
    <div className="col-span-3 flex min-w-0 flex-col gap-4">
      <BriefLabel>Your briefing · {briefing.window}</BriefLabel>
      <h2 className="font-bold text-text-primary typo-title1">
        {briefing.headline}
      </h2>
      <ul className="flex flex-col gap-3">
        {briefing.stack.slice(0, 4).map((line) => (
          <li key={line.text} className="flex gap-3">
            <span className="mt-0.5 w-16 shrink-0 text-text-quaternary typo-caption1">
              {line.why}
            </span>
            <span className="min-w-0 flex-1 text-text-primary typo-callout">
              {line.text}{' '}
              {line.sources.map((post) => (
                <SourceChip key={post.id} post={post} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-4">
        <Actions />
        <span className="text-text-quaternary typo-caption1">
          {briefing.stats}
        </span>
      </div>
    </div>
    <div className="col-span-2 flex min-w-0 flex-col gap-6 border-l border-border-subtlest-tertiary pl-8">
      <AroundYou />
      <div className="mt-auto flex flex-col gap-2 rounded-12 bg-surface-float p-4">
        <span className="font-bold text-text-primary typo-callout">
          Worth your time
        </span>
        <span className="text-text-secondary typo-footnote">
          {briefing.worth.text} <SourceChip post={briefing.worth.source} />
        </span>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* H2 · Newsletter                                                     */
/* ------------------------------------------------------------------ */

/** One paragraph, cited like an answer engine, expanding into the rest. */
export const BriefNewsletter = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const lines = isOpen ? briefing.stack : briefing.stack.slice(0, 3);

  return (
    <section className="flex flex-col gap-4 rounded-16 bg-background-subtle p-6">
      <div className="flex items-center gap-4">
        <BriefLabel>Your briefing</BriefLabel>
        <span className="text-text-quaternary typo-caption1">
          {briefing.window}
        </span>
        <div className="ml-auto">
          <Actions />
        </div>
      </div>
      <p className="max-w-[64rem] text-text-primary typo-title3">
        <span className="font-bold">{briefing.headline}</span>{' '}
        {lines.map((line) => (
          <React.Fragment key={line.text}>
            {line.text}{' '}
            {line.sources.map((post) => (
              <SourceChip key={post.id} post={post} />
            ))}{' '}
          </React.Fragment>
        ))}
      </p>
      <p className="max-w-[64rem] text-text-secondary typo-callout">
        Around you: {briefing.around.map((item) => item.text).join('; ')}.
      </p>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="self-start font-bold text-text-link typo-footnote hover:underline"
      >
        {isOpen ? 'Show less' : `Read the full briefing · ${briefing.stats}`}
      </button>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* H3 · Timeline                                                       */
/* ------------------------------------------------------------------ */

const lenses = ['Everything', 'Your stack', 'Your people'] as const;

/** What happened since you left, in order, filterable by lens. */
export const BriefTimeline = (): ReactElement => {
  const [lens, setLens] = useState<(typeof lenses)[number]>('Everything');
  const stack = lens !== 'Your people';
  const people = lens !== 'Your stack';

  return (
    <section className="flex min-h-[27.5rem] flex-col gap-4 rounded-16 bg-background-subtle p-6">
      <div className="flex items-center gap-4">
        <BriefLabel>{briefing.window}</BriefLabel>
        <div className="ml-auto flex items-center gap-1 rounded-10 bg-surface-float p-1">
          {lenses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLens(item)}
              className={classNames(
                'h-7 rounded-8 px-3 typo-caption1',
                item === lens
                  ? 'bg-text-primary font-bold text-surface-invert'
                  : 'text-text-tertiary',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <h2 className="font-bold text-text-primary typo-title2">
        {briefing.headline}
      </h2>
      <ol className="relative flex flex-col gap-4 before:absolute before:bottom-2 before:left-[3.25rem] before:top-2 before:w-px before:bg-border-subtlest-tertiary">
        {stack &&
          briefing.stack.map((line) => (
            <li key={line.text} className="relative flex items-start gap-4">
              <span className="w-10 shrink-0 text-right tabular-nums text-text-quaternary typo-caption1">
                {line.at}
              </span>
              <span className="relative z-1 mt-1 size-2.5 shrink-0 rounded-max border-2 border-background-subtle bg-accent-cabbage-default" />
              <span className="min-w-0 flex-1 text-text-primary typo-callout">
                {line.text}{' '}
                {line.sources.map((post) => (
                  <SourceChip key={post.id} post={post} />
                ))}
              </span>
            </li>
          ))}
        {people &&
          briefing.around.map((item) => (
            <li key={item.text} className="relative flex items-start gap-4">
              <span className="w-10 shrink-0 text-right tabular-nums text-text-quaternary typo-caption1">
                {item.at}
              </span>
              <span className="relative z-1 mt-1 size-2.5 shrink-0 rounded-max border-2 border-background-subtle bg-accent-bacon-default" />
              <span className="min-w-0 flex-1 text-text-secondary typo-callout">
                {item.text}
              </span>
            </li>
          ))}
      </ol>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* H4 · As a widget                                                    */
/* ------------------------------------------------------------------ */

/** The briefing as the lead widget of the shelf, at any size. */
export const BriefWidgetContent = ({
  size,
}: {
  size: 's' | 'm' | 'w' | 'l';
}): ReactElement => {
  if (size === 's') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <BriefLabel compact>Your briefing</BriefLabel>
        <span className="mt-auto line-clamp-3 font-bold text-text-primary typo-callout">
          {briefing.headline}
        </span>
        <span className="text-text-tertiary typo-caption1">
          5 things · 4 min
        </span>
      </div>
    );
  }
  const count = { m: 4, w: 2, l: 4 }[size];
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <BriefLabel compact>Your briefing · last 24h</BriefLabel>
      <span
        className={classNames(
          'font-bold text-text-primary',
          size === 'l' ? 'typo-title2' : 'typo-callout',
        )}
      >
        {briefing.headline}
      </span>
      <ul
        className={classNames(
          'min-h-0 gap-2 overflow-hidden',
          size === 'w' ? 'grid grid-cols-2' : 'flex flex-col',
        )}
      >
        {briefing.stack.slice(0, count).map((line) => (
          <li
            key={line.text}
            className="line-clamp-2 text-text-secondary typo-footnote"
          >
            <span className="text-text-quaternary">{line.why} </span>
            {line.text}
          </li>
        ))}
      </ul>
      {size === 'l' && (
        <div className="mt-auto">
          <Actions />
        </div>
      )}
    </div>
  );
};

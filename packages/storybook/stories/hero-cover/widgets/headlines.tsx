import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BriefIcon } from '@dailydotdev/shared/src/components/icons/Brief';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { MegaphoneIcon } from '@dailydotdev/shared/src/components/icons/Megaphone';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import type { WidgetSize } from './catalog';
import { Stack, WidgetLabel } from './production';
import { Scroll } from './scroll';

/*
 * Topical digest, as the Headlines list of the Your Daily page (#6194,
 * features/daily/CoverTopics.tsx, removed in #6476): one story from each
 * topic digest the reader follows, the topic as a colored eyebrow over a
 * bold title, rows split by hairlines, no images and no numbers. Topics
 * and their colors come from channelConfigurations, which main still has.
 */

export type Headline = {
  id: string;
  topic: string;
  /** channelConfigurations.color: one of our accents. */
  tone: string;
  title: string;
  summary: string;
};

export const headlines: Headline[] = [
  {
    id: 'ai',
    topic: 'AI',
    tone: 'cabbage',
    title:
      'Netflix explains how it taught an LLM to recommend, and why models lose the middle of your prompt',
    summary:
      'A ByteByteGo breakdown of Netflix’s recommender and a study on how long prompts bury what sits in the middle.',
  },
  {
    id: 'backend',
    topic: 'Backend',
    tone: 'water',
    title:
      'Node.js 26.11.1 is out, and Booking.com cut its Node bill by 38% moving to Watt',
    summary:
      'A security release, and a case study on running Node services on Watt instead of plain processes.',
  },
  {
    id: 'frontend',
    topic: 'Frontend',
    tone: 'bacon',
    title:
      'TanStack Charts reaches 1.0 the same day a Router crash course lands',
    summary:
      'The headless charting library goes stable, with a course that walks through TanStack Router from scratch.',
  },
  {
    id: 'devops',
    topic: 'DevOps',
    tone: 'avocado',
    title: 'A postinstall supply-chain attack hits 40 npm packages',
    summary:
      'Compromised maintainer tokens pushed versions that ran a credential stealer on install. Pin and audit.',
  },
  {
    id: 'databases',
    topic: 'Databases',
    tone: 'cheese',
    title:
      'Postgres gets pg_plan_filter 1.0, and SqlClient’s new pool speeds up parallel connections',
    summary:
      'A guard against runaway query plans, and a connection pool rewrite that cuts contention under load.',
  },
  {
    id: 'security',
    topic: 'Security',
    tone: 'ketchup',
    title:
      'Two critical PHP flaws sat in the codebase for over a decade before AI helped find them',
    summary:
      'Researchers used models to spot the bugs and build working exploits in weeks; the emergency patch is out.',
  },
];

const tone = (name: string): string => `var(--theme-accent-${name}-default)`;

const preventDefault = (event: React.MouseEvent): void =>
  event.preventDefault();

const Gear = (): ReactElement => (
  <button
    type="button"
    aria-label="Manage topics"
    title="Manage topics"
    className="flex size-6 shrink-0 items-center justify-center rounded-8 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
  >
    <SettingsIcon size={IconSize.Size16} />
  </button>
);

const Row = ({
  headline,
  hasSummary,
}: {
  headline: Headline;
  hasSummary?: boolean;
}): ReactElement => (
  <li className="border-b border-border-subtlest-tertiary last:border-0">
    <a
      href="#"
      onClick={preventDefault}
      className="-mx-4 flex flex-col gap-0.5 px-4 py-2.5 transition-colors hover:bg-surface-hover"
    >
      <span
        className="font-bold typo-caption1"
        style={{ color: tone(headline.tone) }}
      >
        {headline.topic}
      </span>
      <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
        {headline.title}
      </span>
      {hasSummary && (
        <span className="line-clamp-1 text-text-tertiary typo-caption1">
          {headline.summary}
        </span>
      )}
    </a>
  </li>
);

/** The Plus reader's brief leads the list, in the brief's own voice. */
const BriefRow = (): ReactElement => (
  <li className="border-b border-border-subtlest-tertiary">
    <a
      href="#"
      onClick={preventDefault}
      className="-mx-4 flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-surface-hover"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-accent-onion-default text-white">
        <BriefIcon secondary size={IconSize.Size16} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-bold text-brand-default typo-caption1">
          Your briefing
        </span>
        <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
          Node had a big day, and TanStack shipped Charts 1.0
        </span>
      </span>
    </a>
  </li>
);

export const HeadlinesWidget = ({
  size,
  items = headlines,
  hasBrief = false,
}: {
  size: WidgetSize;
  items?: Headline[];
  /** Plus readers subscribed to briefings get today's brief first. */
  hasBrief?: boolean;
}): ReactElement => {
  const label = <WidgetLabel kind="digest" trailing={<Gear />} />;

  if (!items.length) {
    return (
      <Stack mood="headlines">
        {label}
        <div className="m-auto flex flex-col items-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-max bg-accent-water-flat text-accent-water-default">
            <MegaphoneIcon secondary size={IconSize.Small} />
          </span>
          <span className="font-bold text-text-primary typo-callout">
            No headlines, yet
          </span>
          {size !== 's' && (
            <span className="text-text-tertiary typo-footnote">
              Pick the topics you want one story from every day.
            </span>
          )}
          <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
            Choose topics
          </Button>
        </div>
      </Stack>
    );
  }

  return (
    <Stack mood="headlines">
      {label}
      <Scroll>
        <ul
          className={classNames('flex flex-col', size === 'l' && 'max-w-full')}
        >
          {hasBrief && <BriefRow />}
          {items.map((headline) => (
            <Row
              key={headline.id}
              headline={headline}
              hasSummary={size === 'l'}
            />
          ))}
        </ul>
      </Scroll>
    </Stack>
  );
};

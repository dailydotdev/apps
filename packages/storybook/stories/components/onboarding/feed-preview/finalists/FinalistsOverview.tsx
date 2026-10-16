import type { ReactElement } from 'react';
import React from 'react';
import { linkTo } from '@storybook/addon-links';

const FINALISTS_TITLE = 'Components/Onboarding/Feed preview/Finalists';
const ARCHIVE_TITLE = 'Components/Onboarding/Feed preview/Archive';

const STATS = [
  { value: '~10%', label: 'see the preview today' },
  { value: '2.2×', label: 'day 1 return for those who do' },
  { value: '83% vs 91%', label: 'finish onboarding, preview vs not' },
];

const FINALISTS = [
  {
    letter: 'A',
    name: 'Short list + progress',
    story: 'A · Short list + progress',
    idea: 'Five compact posts matched to your tags, behind a button that unlocks at 5 tags. A progress bar sits under the title, and the title moves from "Pick tags" to "Keep tuning your feed", "getting smarter" and "dialed in".',
    builtOn:
      "Tomer's progress header from the swipe onboarding (#5838): typing headline, flowing bar, a burst at 5, 10 and 20 tags.",
    behavior: 'Preview opens on a click, as Ido asked',
    watch: 'Preview open rate, completion back to 91%',
  },
  {
    letter: 'F',
    name: 'Example discussions',
    story: 'F · Example discussions',
    idea: 'Three of the most commented articles of the last 90 days in your tags, in the same flat rows as A. Each row ends in one people strip: the faces of who joined in, with upvotes and comments beside them. Show more adds three at a time.',
    builtOn:
      'Real commenters and upvoters, so the snapshot shows how developers engage with the news without making you read the thread.',
    behavior: 'Shows after 5 tags without a click, needs Ido’s yes',
    watch: 'Day 1 return, first comment or upvote in 14 days',
  },
  {
    letter: 'O',
    name: 'Build moment',
    story: 'O · Build moment',
    idea: 'Continue plays two seconds of "Building your feed": tags check off, the bar fills, posts arrive, then Patchy gets his bone and the feed is ready. Continue goes on, Tune my tags goes back to the step.',
    builtOn:
      "Patchy's waiting and fed art from Tomer's Feed Patchy (#6834), and the same bar and burst as A.",
    behavior: 'Plays after Continue, so every user sees it',
    watch: 'Day 1 return for everyone who finishes the step',
  },
];

export const FinalistsOverview = (): ReactElement => (
  <div className="min-h-dvh bg-background-default px-6 py-12 text-text-primary">
    <div className="mx-auto flex max-w-[60rem] flex-col gap-12">
      <header className="flex flex-col gap-4">
        <span className="font-bold text-brand-default typo-callout">
          Onboarding · Pick tags step · Finalists
        </span>
        <h1 className="font-bold typo-mega3">
          Three ways to sell the feed before Continue
        </h1>
        <p className="max-w-[44rem] text-text-secondary typo-title3">
          A makes the step itself rewarding, F puts the community in front, and
          O celebrates the moment the feed is ready.
        </p>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
            >
              <span className="font-bold tabular-nums typo-title2">
                {value}
              </span>
              <span className="text-text-tertiary typo-footnote">{label}</span>
            </div>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 laptop:grid-cols-3">
        {FINALISTS.map((finalist) => (
          <button
            key={finalist.letter}
            className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-5 text-left"
            onClick={linkTo(FINALISTS_TITLE, finalist.story)}
            type="button"
          >
            <span className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-10 bg-brand-float font-bold text-brand-default typo-body">
                {finalist.letter}
              </span>
              <span className="font-bold typo-title3">{finalist.name}</span>
            </span>
            <span className="text-text-secondary typo-callout">
              {finalist.idea}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {finalist.builtOn}
            </span>
            <span className="mt-auto flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-3 typo-footnote">
              <span className="font-bold text-text-primary">
                {finalist.behavior}
              </span>
              <span className="text-text-tertiary">
                Watch: {finalist.watch}
              </span>
            </span>
          </button>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-16 border border-brand-default p-5">
        <span className="font-bold uppercase text-text-quaternary typo-caption1">
          How to test them
        </span>
        <p className="typo-body">
          A and O fit together: A on the step, O right after Continue. Ship them
          as one arm against today, so every pick feels like progress and every
          finished step ends in a reward. F is the second arm if Ido agrees to
          posts showing without a click.
        </p>
        <p className="text-text-secondary typo-callout">
          Guardrail: completion for preview users gets back to the 91% of those
          who skip it. Primary: day 1 and day 7 to 13 return for everyone who
          reaches the tag step.
        </p>
      </section>

      <button
        className="self-start font-bold text-brand-default typo-callout"
        onClick={linkTo(ARCHIVE_TITLE, 'Research and rounds 1–2')}
        type="button"
      >
        See the research and the 14 archived directions
      </button>
    </div>
  </div>
);

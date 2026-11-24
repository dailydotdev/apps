import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Growth/Reading reminder hero/0. Read me first',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Stat = ({
  value,
  label,
}: {
  value: string;
  label: string;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <span className="font-bold text-text-primary typo-title2">{value}</span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

const Change = ({
  index,
  title,
  today,
  proposed,
  story,
}: {
  index: number;
  title: string;
  today: ReactNode;
  proposed: ReactNode;
  story: string;
}): ReactElement => (
  <a
    href={`?path=/story/${story}`}
    target="_top"
    className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 hover:bg-surface-hover"
  >
    <p className="font-bold text-text-primary typo-callout">
      {index}. {title}
    </p>
    <div className="grid grid-cols-1 gap-3 typo-footnote tablet:grid-cols-2">
      <div className="flex flex-col gap-1">
        <span className="font-bold text-text-quaternary typo-caption1">
          Today
        </span>
        <span className="text-text-secondary">{today}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold text-accent-cabbage-default typo-caption1">
          Proposed
        </span>
        <span className="text-text-secondary">{proposed}</span>
      </div>
    </div>
  </a>
);

const Note = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4">
    <p className="font-bold text-text-primary typo-callout">{title}</p>
    <div className="text-text-secondary typo-footnote">{children}</div>
  </div>
);

const beforeAfter = 'growth-reading-reminder-hero-1-before-and-after';
const flow = 'growth-reading-reminder-hero-2-flow';
const devSpec = 'growth-reading-reminder-hero-3-dev-spec--dev-spec';

export const ReadMe: StoryObj = {
  name: 'Read me first',
  render: () => (
    <div className="mx-auto flex max-w-[64rem] flex-col gap-8 px-4 py-10 tablet:px-8">
      <header className="flex flex-col gap-2">
        <span className="text-text-tertiary typo-footnote">
          Growth · design follow-up, Nov 2026
        </span>
        <h1 className="font-bold text-text-primary typo-large-title">
          “Never miss a learning day” hero
        </h1>
        <p className="max-w-[44rem] text-text-secondary typo-body">
          Keep the hero, same slot and same height, and fix how it asks. This is
          a Storybook demo only: production still runs the June version
          (useReadingReminderHero). The pages render the real production cards
          next to the proposal: ReadingReminderFeedHero on phones and tablets,
          TopHero above the feed from 1024px up.
        </p>
        <a
          href={`?path=/story/${devSpec}`}
          target="_top"
          className="w-fit rounded-12 bg-surface-float px-3 py-2 font-bold text-text-primary typo-callout hover:bg-surface-hover"
        >
          Building it? Read the dev spec →
        </a>
      </header>

      <section className="grid grid-cols-2 gap-3 laptop:grid-cols-4">
        <Stat value="4.1%" label="of viewers tap it (7–9% in the apps)" />
        <Stat value="93%" label="of tappers save a reminder" />
        <Stat value="17%" label="of all new reading reminders come from it" />
        <Stat value="54%" label="of tappers allow push today" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-text-primary typo-title3">
          The six changes
        </h2>
        <Change
          index={1}
          title="Centered on every width"
          today="Left-aligned: a row with the cat on the right on tablets, and a compact row above the feed with the cat on the left from 1024px up. The desktop row gets 2.8% taps."
          proposed="Centered everywhere, like phones and the apps, which get 5–9%. Laptop keeps its slot above the feed and its height."
          story={`${beforeAfter}--responsive`}
        />
        <Change
          index={2}
          title="Reading Patchy and copy that sells the post"
          today="Sleeping cat. “Turn on your daily reading reminder and keep your routine.”"
          proposed="Patchy. “Make reading a daily habit. One top pick a day at 8:00 PM, when you’re reading now. Skipped on days you’ve read.” The reading Patchy art still needs uploading to media.daily.dev before it ships."
          story={`${beforeAfter}--responsive`}
        />
        <Change
          index={3}
          title="The hour they read"
          today="Saves 9 AM for everyone, without saying so."
          proposed="The hour they’re reading at now, named on the button (“Send it at 8 PM”), with “Other time” for three presets. No new data needed."
          story={`${flow}--interactive`}
        />
        <Change
          index={4}
          title="Push before saving"
          today="Saves the reminder, then asks for push. 46% don’t allow it, so almost half of the reminders it saves can’t arrive."
          proposed="Asks for push first and saves only once it’s allowed. Already allowed skips the ask. Blocked shows how to turn it on. Hidden where push can’t work (iOS Safari outside an installed app)."
          story={`${flow}--all-states`}
        />
        <Change
          index={5}
          title="Light theme on phones"
          today="Fixed dark colors: in light theme the title and button disappear."
          proposed="Theme tokens, so it reads in both themes."
          story={`${beforeAfter}--themes`}
        />
        <Change
          index={6}
          title="Close counts on every device"
          today="Closing is stored per device: 23% of people who closed it saw it again."
          proposed="Closing is stored on the account, so it’s gone everywhere."
          story={`${flow}--close-everywhere`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-text-primary typo-title3">
          Before building
        </h2>
        <div className="grid grid-cols-1 gap-3 laptop:grid-cols-3">
          <Note title="The paused-reminder message shares the slot">
            People whose reminder is on but can’t get push see “Your reminder is
            on, but we can’t reach you” in the same slot (#7013). It moves to
            the new layout too; see Flow · All states.
          </Note>
          <Note title="Copy comes from a flag">
            Title and subtitle come from reading_reminder_hero_copy. Check that
            no experiment runs on it before replacing the copy in code.
          </Note>
          <Note title="Onboarding is testing the same ideas">
            Patchy art, push first, and a time picker (#7175). Match the hero to
            whichever onboarding version wins.
          </Note>
        </div>
      </section>
    </div>
  ),
};

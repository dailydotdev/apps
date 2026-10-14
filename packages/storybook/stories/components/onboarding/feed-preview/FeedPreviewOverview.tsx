import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { linkTo } from '@storybook/addon-links';

const STORY_TITLE = 'Components/Onboarding/Feed preview';

const STATS = [
  {
    value: '~10%',
    label: 'see the preview',
    detail:
      '450 to 560 of the 4,100 to 5,600 users a week who reach the tag step',
  },
  {
    value: '2.2×',
    label: 'day 1 return',
    detail: '35% vs 16% for users with 5 to 9 tags. 2.4× on days 7 to 13.',
  },
  {
    value: '2.3×',
    label: 'reads in 14 days',
    detail: '9.7 vs 4.2 for users with 5 to 9 tags. 1.4× with 10 or more.',
  },
  {
    value: '83% vs 91%',
    label: 'finish onboarding',
    detail: 'Preview users with 5 to 9 tags finish less often.',
  },
];

const PROBLEMS = [
  {
    title: 'Hard to find',
    body: 'The toggle is a quiet pill under 25 tags and a search field, below the fold on a phone. Until 5 tags are picked it reads "3/5 to show feed preview".',
  },
  {
    title: 'Opens a whole feed',
    body: 'One tap renders up to a page of full-size image cards that break out of the step to the full screen width. On a 390px phone the step grows to about 6,000px.',
  },
  {
    title: 'Not tied to the tags',
    body: 'Nothing says why a post is there. Toggling a tag swaps posts a second later with no cue, so the preview never feels like the result of the picks.',
  },
  {
    title: 'Cards are dead ends',
    body: 'Preview mode strips the link and the action bar, so a card looks tappable but does nothing, and shows no upvotes or comments to say anyone reads it.',
  },
  {
    title: 'Never ends',
    body: 'The feed has no conclusion, Continue floats over the cards, and the only copy asks people to keep changing tags until they are happy. A likely reason preview users finish less often (to be confirmed).',
  },
];

const OTHERS = [
  {
    name: 'Wikipedia iOS (2026)',
    pattern:
      'Topic chips above a small grid that swaps in matching articles as you pick. The closest precedent.',
  },
  {
    name: 'Feedly',
    pattern:
      'Dropped big article previews from source cards: they broke the hierarchy. Shows articles per week instead.',
  },
  {
    name: 'Substack',
    pattern:
      'Compact rows with avatar, category and count, with Continue docked below.',
  },
  {
    name: 'Pinterest',
    pattern:
      'No live preview. A short "great picks" recap, then the real feed.',
  },
  {
    name: 'Medium, Product Hunt, Spotify, Flipboard',
    pattern:
      'Pick a minimum (3 to 7), no preview. The home feed itself is the reveal.',
  },
];

interface Direction {
  letter: string;
  name: string;
  story: string;
  idea: string;
  fixes: string;
  effort: string;
  isPick?: boolean;
  isOpenQuestion?: boolean;
}

const DIRECTIONS: Direction[] = [
  {
    letter: 'A',
    name: 'Short list',
    story: 'A · Short list',
    idea: 'Five compact rows inside the step: source, title, the tag it matched and engagement. It fades out with a line saying the full feed opens next.',
    fixes: 'Opens a whole feed, not tied to the tags, dead ends, never ends',
    effort: 'Small. New row component, cap the list in EditTag.',
    isPick: true,
  },
  {
    letter: 'B',
    name: 'Split view',
    story: 'B · Split view',
    idea: 'On laptops the preview becomes a sticky "Your feed" column next to the tags, so every pick visibly changes it. Phones get A.',
    fixes: 'Hard to find, opens a whole feed, not tied to the tags',
    effort: 'Medium. Two-column layout for the step on laptop.',
    isPick: true,
  },
  {
    letter: 'C',
    name: 'Peek sheet',
    story: 'C · Peek sheet',
    idea: 'The trigger docks right above Continue, where every user sees it. It opens a sheet whose main button is "Looks good, continue".',
    fixes: 'Hard to find, never ends',
    effort: 'Small. Uses the docked slot and the shared Modal.',
  },
  {
    letter: 'D',
    name: 'By tag',
    story: 'D · By tag',
    idea: 'One short row of posts per picked tag, so each pick shows what it adds.',
    fixes: 'Not tied to the tags',
    effort: 'Medium. Groups the preview client-side by tag.',
  },
  {
    letter: 'E',
    name: 'Real cards, contained',
    story: 'E · Real cards, contained',
    idea: 'Keeps the production feed cards, but two columns inside the step, four posts, and no click-through.',
    fixes: 'Opens a whole feed, never ends',
    effort: 'Smallest. Layout and limits on the existing Feed.',
  },
  {
    letter: 'F',
    name: 'Auto strip',
    story: 'F · Auto strip',
    idea: 'No button. After 5 tags a slim "Trending in your interests" strip of three posts appears. Ido advised against opening by default, so this is only an A/B arm.',
    fixes: 'Hard to find',
    effort: 'Small, but it changes behavior, not only looks.',
    isOpenQuestion: true,
  },
];

interface BoldDirection {
  letter: string;
  name: string;
  story: string;
  idea: string;
  why: string;
  isAlwaysOn?: boolean;
  isPick?: boolean;
}

const BOLD_DIRECTIONS: BoldDirection[] = [
  {
    letter: 'G',
    name: 'Tag peek',
    story: 'G · Tag peek',
    idea: 'No panel at all. Hovering a tag, or picking one on a phone, shows its two top posts this week right on the chip.',
    why: 'The answer to "what does this tag give me" appears at the moment of choice, so the 90% who never open a preview still see it.',
  },
  {
    letter: 'H',
    name: 'Pick toasts',
    story: 'H · Pick toasts',
    idea: 'Every new pick drops a small card above Continue: "#rust adds posts like" and one real post. It fades after a few seconds.',
    why: 'Instant feedback per tap, next to the button people are about to press. Nothing to open, nothing to scroll.',
    isAlwaysOn: true,
    isPick: true,
  },
  {
    letter: 'I',
    name: 'On your phone',
    story: 'I · On your phone',
    idea: 'On laptops a phone mockup beside the tags shows the app feed filling up as you pick. Phones get A.',
    why: 'Shows the product, not a list, and quietly says daily.dev lives on your phone too.',
    isAlwaysOn: true,
  },
  {
    letter: 'J',
    name: 'First edition',
    story: 'J · First edition',
    idea: 'The preview as a front page: masthead, date, a lead story with image and four headlines from your tags.',
    why: 'A finished, editorial object feels made for you. It reads in two seconds and has a clear end.',
  },
  {
    letter: 'K',
    name: 'Swipe to tune',
    story: 'K · Swipe to tune',
    idea: 'Six real posts as a card stack. Swipe right for more like this, which adds a related tag to the picker; left to skip.',
    why: 'Reacting to posts is easier than naming topics, and tuning by hand is the IKEA effect at work.',
  },
  {
    letter: 'L',
    name: 'You vs everyone',
    story: 'L · You vs everyone',
    idea: 'Your top posts beside the generic popular ones, with "Only for you" on posts your tags brought in.',
    why: 'Makes the value of picking tags visible, which is the whole point of the step.',
  },
  {
    letter: 'M',
    name: 'Feed mix',
    story: 'M · Feed mix',
    idea: 'A thin bar of what your feed will talk about, by tag, with the top post of the selected slice.',
    why: 'One line instead of a feed, and it reacts to every pick. Real shares need per-tag weekly volume from the API.',
    isAlwaysOn: true,
  },
  {
    letter: 'N',
    name: 'Now playing',
    story: 'N · Now playing',
    idea: 'A single docked row above Continue cycles your top posts every few seconds. Tap it for the full list.',
    why: "Spotify's mini player: always in view, never in the way, and the sheet ends at Continue.",
    isAlwaysOn: true,
  },
  {
    letter: 'O',
    name: 'Build moment',
    story: 'O · Build moment',
    idea: 'No preview on the step. Continue plays a two-second "Building your feed": tags check off, real posts arrive, then "Your feed is ready".',
    why: 'Every user sees their feed, not 10%, and the step stays clean as Ido wants. Backed by the labor illusion research.',
    isPick: true,
  },
  {
    letter: 'P',
    name: 'Tomorrow morning',
    story: 'P · Tomorrow morning',
    idea: 'A lock screen for tomorrow at 8:00 with three of your posts as notifications.',
    why: 'Sells the return visit, which is the metric that moved, and sets up the reading reminder.',
  },
];

const EVERY_VARIANT = [
  'Helper copy ("Pick 2 more tags to preview your feed") replaces the 3/5 counter.',
  'Each post names the tag it matched and shows its upvotes and comments, so the sample reads as alive.',
  'The preview is capped at a handful of posts and closes by saying the full feed opens next.',
  'Toggling a tag shows a short loading state, then highlights the new posts.',
];

const Section = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <span className="font-bold uppercase text-text-quaternary typo-caption1">
        {eyebrow}
      </span>
      <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
    </div>
    {children}
  </section>
);

export const FeedPreviewOverview = (): ReactElement => (
  <div className="min-h-dvh bg-background-default px-6 py-12 text-text-primary">
    <div className="mx-auto flex max-w-[60rem] flex-col gap-14">
      <header className="flex flex-col gap-4">
        <span className="font-bold text-brand-default typo-callout">
          Onboarding · Pick tags step
        </span>
        <h1 className="font-bold typo-mega3">
          Make the feed preview worth opening
        </h1>
        <p className="max-w-[44rem] text-text-secondary typo-title3">
          The preview is the one moment a new user sees their feed before they
          commit to it. Today it opens as a full-width feed. It should be a
          short sample matched to their tags that keeps Continue in reach.
        </p>
      </header>

      <Section eyebrow="Why it matters" title="The users who see it stay">
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-4">
          {STATS.map(({ value, label, detail }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
            >
              <span className="font-bold tabular-nums typo-title1">
                {value}
              </span>
              <span className="font-bold typo-callout">{label}</span>
              <span className="text-text-tertiary typo-footnote">{detail}</span>
            </div>
          ))}
        </div>
        <p className="text-text-tertiary typo-footnote">
          Users who reached the tag step Aug 9 to Sep 29, about 32k, compared at
          the same tag count. This is correlation: motivated users open the
          preview more. Only an A/B test shows cause. Source: Agent Smith in
          Slack, Oct 14.
        </p>
      </Section>

      <Section eyebrow="What's wrong today" title="Five reasons it looks bad">
        <ol className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {PROBLEMS.map(({ title, body }, index) => (
            <li
              key={title}
              className="flex gap-3 rounded-16 border border-border-subtlest-tertiary p-4"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-max bg-surface-float font-bold typo-footnote">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-bold typo-callout">{title}</span>
                <span className="text-text-secondary typo-callout">{body}</span>
              </span>
            </li>
          ))}
        </ol>
        <button
          className="self-start font-bold text-brand-default typo-callout"
          onClick={linkTo(STORY_TITLE, 'Today (production)')}
          type="button"
        >
          See today&apos;s step with this week&apos;s real posts
        </button>
      </Section>

      <Section
        eyebrow="How others do it"
        title="Almost nobody shows a full feed under the picker"
      >
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
          {OTHERS.map(({ name, pattern }) => (
            <div
              key={name}
              className="flex flex-col gap-1 p-4 tablet:flex-row tablet:gap-6"
            >
              <span className="font-bold typo-callout tablet:w-56 tablet:shrink-0">
                {name}
              </span>
              <span className="text-text-secondary typo-callout">
                {pattern}
              </span>
            </div>
          ))}
        </div>
        <p className="text-text-tertiary typo-footnote">
          No published A/B test of an onboarding feed preview exists. The
          supporting evidence is behavioral: showing value before commitment
          (Duolingo moved signup after the first lesson), fast early progress
          lowers drop-off (Conrad et al. 2010), and people value results more
          when they see them being built (Buell and Norton 2011).
        </p>
      </Section>

      <Section eyebrow="Six directions" title="Each one fixes a different part">
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {DIRECTIONS.map((direction) => (
            <button
              key={direction.letter}
              className={classNames(
                'flex flex-col gap-2 rounded-16 border p-4 text-left',
                direction.isPick
                  ? 'border-brand-default bg-brand-float'
                  : 'border-border-subtlest-tertiary',
              )}
              onClick={linkTo(STORY_TITLE, direction.story)}
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-8 bg-surface-float font-bold typo-callout">
                  {direction.letter}
                </span>
                <span className="font-bold typo-body">{direction.name}</span>
                {direction.isPick && (
                  <span className="ml-auto font-bold text-brand-default typo-footnote">
                    Recommended
                  </span>
                )}
                {direction.isOpenQuestion && (
                  <span className="ml-auto font-bold text-text-tertiary typo-footnote">
                    Needs Ido&apos;s call
                  </span>
                )}
              </span>
              <span className="text-text-secondary typo-callout">
                {direction.idea}
              </span>
              <span className="text-text-tertiary typo-footnote">
                Fixes: {direction.fixes}
              </span>
              <span className="text-text-tertiary typo-footnote">
                {direction.effort}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section eyebrow="Round two" title="Ten bolder directions">
        <p className="text-text-secondary typo-callout">
          Less "a better panel", more "a different moment". Some live on the
          chips, some next to Continue, one after it. The ones marked
          &quot;Shows without a click&quot; go against Ido&apos;s call and need
          his yes before they run.
        </p>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {BOLD_DIRECTIONS.map((direction) => (
            <button
              key={direction.letter}
              className={classNames(
                'flex flex-col gap-2 rounded-16 border p-4 text-left',
                direction.isPick
                  ? 'border-brand-default bg-brand-float'
                  : 'border-border-subtlest-tertiary',
              )}
              onClick={linkTo(STORY_TITLE, direction.story)}
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-8 bg-surface-float font-bold typo-callout">
                  {direction.letter}
                </span>
                <span className="font-bold typo-body">{direction.name}</span>
                {direction.isPick && (
                  <span className="ml-auto font-bold text-brand-default typo-footnote">
                    Pick
                  </span>
                )}
              </span>
              <span className="text-text-secondary typo-callout">
                {direction.idea}
              </span>
              <span className="text-text-tertiary typo-footnote">
                {direction.why}
              </span>
              {direction.isAlwaysOn && (
                <span className="font-bold text-text-tertiary typo-footnote">
                  Shows without a click
                </span>
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section eyebrow="Recommendation" title="Test A + B against today">
        <div className="flex flex-col gap-3 rounded-16 border border-brand-default p-5">
          <p className="text-text-primary typo-body">
            Ship one arm: the short list (A) on phones and tablets, and the
            split view (B) on laptops, which falls back to A by itself. It keeps
            the preview opt-in as Ido asked and fixes how it looks, and every
            pick visibly changes the result. If we only want the cheapest change
            first, E keeps the production cards, caps the sprawl and gives the
            preview an end.
          </p>
          <p className="text-text-secondary typo-callout">
            C is the arm to add if the open rate stays near 10%: it moves the
            trigger next to Continue, where every user sees it. F only runs if
            Ido agrees to test showing posts by default.
          </p>
          <p className="text-text-secondary typo-callout">
            From round two, O is the strongest bet: it gives every user the
            moment that 10% get today without touching the step. H is the
            smallest way to make each pick pay off on the spot, if Ido is open
            to a card that appears without a click.
          </p>
        </div>
        <h3 className="font-bold typo-body">In every variant</h3>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          {EVERY_VARIANT.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="How we'd know" title="Measure completion first">
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
          {[
            {
              title: 'Guardrail',
              body: "Onboarding completion for users who open the preview gets back to the 91% of those who don't.",
            },
            {
              title: 'Primary',
              body: 'Day 1 and day 7 to 13 return for everyone who reaches the tag step, not only preview openers.',
            },
            {
              title: 'Secondary',
              body: 'Preview open rate (toggle feed preview fires again since #6901) and reads in the first 14 days.',
            },
          ].map(({ title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4"
            >
              <span className="font-bold typo-callout">{title}</span>
              <span className="text-text-secondary typo-callout">{body}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="For engineering" title="What a shipped version touches">
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          <li>
            <code>components/onboarding/EditTag.tsx</code>: replace the
            full-width Feed with the capped preview, behind an experiment flag
            (default off).
          </li>
          <li>
            <code>components/feeds/FeedPreviewControls.tsx</code>: the trigger
            with the source stack and helper copy, keeping the{' '}
            <code>toggle feed preview</code> event and{' '}
            <code>data-funnel-track</code>.
          </li>
          <li>
            A compact preview row is new. The matched tag is computed in the
            client from <code>post.tags</code> and the picked tags, so no
            backend change is needed.
          </li>
          <li>
            Variant B needs the step container to use <code>overflow-clip</code>{' '}
            instead of <code>overflow-hidden</code> so the sticky column works.
          </li>
          <li>
            Posts in these stories are real, captured from api.daily.dev on Oct
            14, and matched to the picked tags locally.
          </li>
        </ul>
      </Section>
    </div>
  </div>
);

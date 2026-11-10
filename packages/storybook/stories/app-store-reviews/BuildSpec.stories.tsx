import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';

// The builder handoff for the App Store review ideas: components, states,
// accessibility and the gaps a builder would hit. Text in backticks renders
// as code.

const Rich = ({ text }: { text: string }): ReactElement => (
  <>
    {text.split('`').map((part, index) =>
      index % 2 ? (
        <code
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="rounded-6 bg-surface-float px-1 py-0.5 font-mono text-text-primary typo-footnote"
        >
          {part}
        </code>
      ) : (
        part
      ),
    )}
  </>
);

const Section = ({
  number,
  title,
  intro,
  children,
}: {
  number: number;
  title: string;
  intro?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <Typography type={TypographyType.Title2} tag={TypographyTag.H2} bold>
        {number}. {title}
      </Typography>
      {intro && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="max-w-[48rem]"
        >
          <Rich text={intro} />
        </Typography>
      )}
    </div>
    {children}
  </section>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: string[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary bg-background-default">
    <table className="w-full min-w-[40rem] text-left">
      <thead>
        <tr className="border-b border-border-subtlest-tertiary">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 font-bold text-text-tertiary typo-footnote"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row[0]}
            className="border-b border-border-subtlest-tertiary align-top last:border-0"
          >
            {row.map((cell, index) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={
                  index === 0
                    ? 'w-48 px-4 py-3 font-bold text-text-primary typo-callout'
                    : 'px-4 py-3 text-text-secondary typo-callout'
                }
              >
                <Rich text={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Cards = ({
  cards,
}: {
  cards: { title: string; items: string[] }[];
}): ReactElement => (
  <div className="grid gap-4 tablet:grid-cols-2">
    {cards.map((card) => (
      <div
        key={card.title}
        className="flex min-w-0 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-5"
      >
        <Typography type={TypographyType.Body} tag={TypographyTag.H3} bold>
          {card.title}
        </Typography>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-text-secondary typo-callout marker:text-text-quaternary">
          {card.items.map((item) => (
            <li key={item}>
              <Rich text={item} />
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const copy = [
  ['Headline', 'A little love goes a long way. ❤️'],
  [
    'Body',
    'If daily.dev has made your day a little better, a quick rating would mean a lot to us.',
  ],
  [
    'Short body',
    'Made your day a little better? A quick rating means a lot. (cards inside an existing sheet)',
  ],
  ['CTA', 'Rate daily.dev, which opens `review-open-store`'],
  ['Profile row', 'Show daily.dev some love ❤️'],
];

const plumbing = [
  [
    'Bridge handlers',
    'In `lib/ios.ts`, add `ReviewRequest = "review-request"` and `ReviewOpenStore = "review-open-store"` to `WebKitMessageHandlers`, plus `iOSSupportsReview()` (built with `messageHandlerExists`), `requestIOSReview()` and `openIOSWriteReview()`, modeled on `requestIOSTracking`.',
  ],
  [
    'One coordinator',
    'A new `hooks/useReviewPrompt.ts`. Every trigger calls `tryAskForReview(source)`; the hook checks eligibility, allows at most one ask per session, shows our surface, waits about 2s and calls `requestIOSReview()`. No idea calls the bridge directly.',
  ],
  [
    'Eligibility',
    '`iOSSupportsReview()`, the idea’s flag is on, no errors this session, not in onboarding or the first session, at most once per app version, and 120 days since the last ask.',
  ],
  [
    'Last-ask storage',
    '`usePersistentContext` key `review_prompt` holding `{ lastAskedAt, appVersion, rated }`. Device-local is enough for the first build: iOS only, and Apple caps the pop-up at 3 a year. Moving the cooldown to the server, per user across devices, can come later.',
  ],
  [
    'Flags',
    'One flag per idea in `lib/featureManagement.ts`, all defaulting to `false`. The review screen is an A/B against the plain ask sheet.',
  ],
  [
    'Back on the feed',
    'Router events: the route changes from a post page to a feed. This is the natural pause every idea waits for.',
  ],
  [
    'Analytics',
    '`LogEvent` review ask impression, click and dismiss, each with `extra.source`. We can’t see whether Apple showed its pop-up or the rating, so measure with App Store Connect ratings per version.',
  ],
];

const ideas = [
  [
    'Streak milestone',
    '30-day and later milestones; Apple’s pop-up about 1.5s after',
    '`NewStreakModal.tsx` gets an `AskCard` under the copy, above the `Checkbox`.',
  ],
  [
    'Profile row',
    'Always there, iOS only',
    'A `ProfileSectionItem` in `ProfileMenu/sections/ResourceSection.tsx` with `icon: AppleIcon` and `onClick: openIOSWriteReview`, no `href`.',
  ],
  [
    'Review screen after a big release',
    'First article on a flagged release, back on the feed',
    'A full-screen `Modal` with `ModalClose`, `LogoIcon`, the testimonial carousel, and `Button` Primary Large with `AppleIcon`.',
  ],
  [
    'Heavy reading week',
    'Over 90 min and 5 reading days in 7 days, back on the feed',
    '`AskSheet`: a `Modal` with `isDrawerOnMobile`, a Primary CTA and a Tertiary “Not now”.',
  ],
  [
    'Plus members',
    'First renewal and Plus anniversary, back on the feed',
    'The thank-you sheet: `DevPlusIcon` on `bg-action-plus-float` / `text-action-plus-default`, `PlusUser`, the stats list, an `AskCard`, Primary “Gift Plus to a friend” and Tertiary “Back to my feed”.',
  ],
];

const pieces = [
  [
    'AskCard',
    '`rounded-16 bg-surface-float p-4`; headline in `Typography` Callout bold; short body in Footnote Tertiary; `Button` Secondary Small with `AppleIcon`.',
  ],
  [
    'AskSheet',
    '`LogoIcon` at `size-12`, no stars (only Apple’s own sheets draw stars); headline in Title2 bold; body in Callout Tertiary; `Button` Primary Large.',
  ],
  [
    'Testimonial card',
    'Five quotes loaded from the same source as daily.dev/wall-of-love, word for word, never a static list in the bundle, so a removed testimonial disappears without an app release. Confirm the wall of love consent covers in-app use. The story shows the current wall of love quotes. `rounded-16 border-border-subtlest-tertiary bg-surface-float p-4`, quote `line-clamp-4`, avatar `size-8 rounded-10`, name Caption1 bold `truncate`, role Caption2 Tertiary `truncate`. No stars: they are not App Store reviews.',
  ],
];

const states = [
  {
    title: 'Empty',
    items: [
      'No testimonials: hide the carousel, the screen still works.',
      'Avatar fails to load: it keeps its size on `bg-surface-float`; in the avatar stack, drop failed images.',
      'A Plus stat is 0: hide that row. All 0: thank-you headline and body only.',
      'Heavy week with no reading data: no trigger.',
    ],
  },
  {
    title: 'Loading',
    items: [
      'No skeletons: the asks are opportunistic. If the data a surface needs (Plus stats, streak) is not in the cache yet, skip the ask this time.',
      'Testimonials not loaded yet: hide the carousel, no skeleton.',
    ],
  },
  {
    title: 'Error and validation',
    items: [
      'App older than 1.26: `iOSSupportsReview()` is false and nothing shows, the profile row included.',
      'Apple shows nothing (yearly cap reached): undetectable, so our card or sheet must stand on its own. Its CTA opens Write a Review.',
      '`openIOSWriteReview()` throws: catch, log, close the sheet. No error toast.',
      'Any error earlier in the session (failed query, crash boundary, failed payment): no asks for the rest of it. Plus: never after a failed renewal, never on checkout or a paywall.',
      'No inputs, so nothing to validate.',
    ],
  },
  {
    title: 'Overflow and long text',
    items: [
      'Headlines wrap to 2 lines, centered; a non-breaking space keeps ❤️ with the last word.',
      'Quotes `line-clamp-4`; names and roles `truncate`.',
      'iPhone SE (568pt tall): the drawer content scrolls inside `Modal` and the CTA stays reachable. Test the Plus sheet first, it is the tallest.',
      'Larger text sizes scale rem: buttons must wrap, not clip.',
      'The carousel scrolls with `snap-x` and the next card peeks.',
    ],
  },
];

const accessibility = [
  {
    title: 'Contrast',
    items: [
      '`text-text-tertiary` at Footnote on `bg-surface-float` (`AskCard`) must reach AA 4.5:1 in light and dark. If not, use `text-text-secondary`.',
      'Buttons use design-system variants, already checked.',
    ],
  },
  {
    title: 'Screen readers',
    items: [
      'No stars on our surfaces, so nothing reads as a rating claim. `LogoIcon` is decorative: `aria-hidden`.',
      'Wrap ❤️ in `aria-hidden` so headlines don’t end with “red heart”.',
      'Avatar stack `alt=""`; testimonial avatar `alt={name}`.',
      'Carousel: a `section` with `aria-label="What developers say"`, each card an `article`.',
      'CTA `aria-label` “Rate daily.dev on the App Store”, visible text unchanged. `ModalClose` is already labeled.',
    ],
  },
  {
    title: 'Focus and keyboard',
    items: [
      '`Modal` traps focus. Order: close, headline, body, carousel, primary CTA, secondary action.',
      'Initial focus on the headline, not the CTA, so nobody rates by accident.',
      'Esc and “Not now” both close.',
    ],
  },
  {
    title: 'Motion and system UI',
    items: [
      'The streak fire animation respects `prefers-reduced-motion`.',
      'Apple’s pop-up and Write a Review screen are drawn by iOS, which handles their accessibility.',
    ],
  },
];

const omissions = [
  [
    'Who already rated',
    'Apple never tells the app. Set `rated: true` when someone taps a Rate daily.dev CTA, and rely on Apple’s yearly cap for the rest.',
  ],
  [
    'App version',
    '“Once per version” needs the native version. Check what the iOS shell passes (user agent, `getDailyClientPlatform`); if nothing, add it to the bridge.',
  ],
  [
    'Plus renewal data',
    'Needs a backend field for the first renewal, the anniversary date and the monthly stats. If the stats don’t exist yet, ship the sheet with the thank-you text only.',
  ],
  [
    'Testimonials source',
    'Check where daily.dev/wall-of-love reads its quotes and whether the API can serve them to the app. Until it can, ship the review screen without the carousel.',
  ],
  [
    'Reading minutes',
    'Time in the reader may not be tracked. Count articles opened over 7 days instead, with the bars in GrowthBook.',
  ],
  [
    'Two asks in one session',
    'The coordinator allows one, in priority order: streak, Plus, heavy week, review screen.',
  ],
  [
    'Android and desktop',
    'Out of scope. Every surface is gated on `iOSSupportsReview()`, so nothing renders elsewhere.',
  ],
  [
    '“Not now” before Apple’s pop-up',
    '`review-request` is scheduled when our sheet or card opens. Closing it or tapping “Not now” in the ~2s before never cancels it. Otherwise only people who stay would be asked, which is review gating.',
  ],
  [
    'Our sheet behind Apple’s',
    'After “Not Now” on Apple’s pop-up our sheet is still open. Intended, and its CTA still works; closing it triggers nothing.',
  ],
  [
    'QA',
    'Apple’s pop-up always shows in development builds from Xcode, never in TestFlight, and is capped in production. Test the bridge with a development build on a real device; in TestFlight check only our surfaces and Write a Review.',
  ],
];

const BuildSpec = (): ReactElement => (
  <div className="min-h-screen bg-background-subtle px-4 py-10 tablet:px-10">
    <div className="mx-auto flex max-w-[64rem] flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="flex items-center gap-2 font-bold text-accent-cabbage-default typo-callout">
          <LogoIcon className={{ container: 'h-5 w-auto' }} />
          MORE APP STORE REVIEWS · BUILD SPEC
        </span>
        <Typography
          type={TypographyType.LargeTitle}
          tag={TypographyTag.H1}
          bold
        >
          Five asks, all on Apple’s native review tools
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-[48rem]"
        >
          <Rich text="iOS app only. Apple’s own rating pop-up (`review-request`, StoreKit requestReview) always opens on its own, never from a tap. Every button opens the App Store’s native Write a Review screen (`review-open-store`). The UI for each idea is in Surfaces." />
        </Typography>
        <a
          href="/?path=/story/app-store-review-surfaces--all-surfaces"
          target="_top"
          className="w-fit font-bold text-accent-cabbage-default typo-callout hover:underline"
        >
          See every surface →
        </a>
      </header>
      <Section number={1} title="Copy">
        <Table head={['Slot', 'Text']} rows={copy} />
      </Section>
      <Section
        number={2}
        title="Shared plumbing"
        intro="Build this first; every idea depends on it."
      >
        <Table head={['Piece', 'Simplest viable build']} rows={plumbing} />
      </Section>
      <Section
        number={3}
        title="Components and tokens"
        intro="Production components where they exist; `AskCard` and `AskSheet` are new. Semantic tokens only, no raw px."
      >
        <Table head={['Idea', 'Trigger', 'Built from']} rows={ideas} />
        <Table head={['New piece', 'Spec']} rows={pieces} />
      </Section>
      <Section number={4} title="Edge cases and states">
        <Cards cards={states} />
      </Section>
      <Section number={5} title="Accessibility">
        <Cards cards={accessibility} />
      </Section>
      <Section
        number={6}
        title="Omissions a builder will hit"
        intro="Each with the simplest way through."
      >
        <Table head={['Gap', 'Simplest solution']} rows={omissions} />
      </Section>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Growth/App Store reviews/Build spec',
  id: 'app-store-review-build-spec',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Spec: StoryObj = {
  name: 'Build spec',
  render: () => <BuildSpec />,
};

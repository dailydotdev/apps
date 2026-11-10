import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';

// Every idea from the "Find a hack to get more App Store reviews" brainstorm
// with Agent Smith, on one board. Ratings data is from App Store Connect as
// pulled on 2026-11-08.

type Risk = 'low' | 'medium' | 'gray';

interface Idea {
  name: string;
  mechanic: string;
  trigger?: string;
  why: string;
  risk: Risk;
  riskNote?: string;
  pick?: boolean;
  // The Surfaces story that shows this idea's UI.
  ui?: string;
}

interface Group {
  title: string;
  subtitle: string;
  ideas: Idea[];
}

const groups: Group[] = [
  {
    title: 'Spend the prompt on the best moment',
    subtitle:
      'iOS shows the system prompt 3 times a year at most, and our 120-day cooldown makes it about one shot. Each fires on its own at a natural break, never from a tap and never at launch, as Apple advises. Ranked best moment first; the first trigger to fire wins.',
    ideas: [
      {
        name: 'Streak milestone close',
        ui: 'streak-prompt',
        mechanic:
          'Call review-request about 1.5s after the 7, 30 or 100-day streak celebration lands, so Apple’s sheet shows over the milestone. Its text is fixed by iOS; the milestone behind it is the context.',
        trigger: 'Streak milestone drawer shown',
        why: 'Proud and retained, with the streak count on screen when Apple asks. The patch is already written in ios/docs/aso/ratings-prompt.md.',
        risk: 'low',
        pick: true,
      },
      {
        name: 'Achievement unlocked',
        mechanic:
          'Fire review-request when the AchievementCompletionModal closes (it logs “dismiss achievement completion”).',
        trigger: 'Achievement unlocked, about 150 iOS users a week',
        why: 'A full-screen “you did it” with a rarity tier and nothing to buy. The most common win on iOS, so it goes near the top.',
        risk: 'low',
        pick: true,
      },
      {
        name: 'Push notification payoff',
        mechanic:
          'After someone opens an upvote-milestone or reply push, reads the result and goes back to the feed. Never as the app launches from the push.',
        trigger: '10/50/100 upvotes, reply to a comment',
        why: 'Being recognized by peers feels better than reading.',
        risk: 'low',
      },
      {
        name: 'Reputation level-up',
        mechanic: 'Prompt after the reputation level-up toast is dismissed.',
        trigger: 'Crossing 250 or 1,000 reputation',
        why: 'Reaches writers and commenters, who leave reviews with substance.',
        risk: 'low',
      },
      {
        name: 'Finished the Brief',
        mechanic:
          'Prompt when someone scrolls to the end of the Brief or a digest.',
        trigger: 'Brief completion',
        why: 'The job is done, and "stay up to date" is our most common praise.',
        risk: 'low',
      },
      {
        name: 'Top Reader or anniversary',
        mechanic:
          'Prompt after the monthly Top Reader badge or the 1-year anniversary card is closed, never as the app launches.',
        trigger: 'Badge award, account anniversary',
        why: 'Long-tenure fans, the "326 consecutive days" people.',
        risk: 'low',
      },
      {
        name: 'Prompt the sharer',
        mechanic:
          'Remember a successful share of a streak card, DevCard or post, and fire review-request in their next session, once they finish an article and land back on the feed. Not mid-share and not at launch.',
        trigger: 'Next session after a successful share, back on the feed',
        why: 'Sharing in public is the clearest sign someone loves the product. Viewers mostly can not rate an app they have not installed, so the card links to download, never to "rate us".',
        risk: 'low',
      },
      {
        name: 'What’s new, then a review screen',
        ui: 'review-screen-after-launch',
        mechanic:
          'After a big release only, coming back to the feed from their first article on the new version opens a full screen of real testimonials from our wall of love. After a short pause on it, Apple’s sheet opens on its own. Its button is “Rate daily.dev”, the write-a-review link.',
        trigger: 'First article on a big release, a few times a year',
        why: 'Left got to a 4.7★ from thousands of ratings with this: it never interrupts, it follows good news, and only active users open the app after an update.',
        risk: 'medium',
        riskNote:
          'Apple prefers its system prompt on its own, so this custom screen is the risky part: never ask for stars in our copy, quote testimonials word for word, skip anyone who already rated.',
        pick: true,
      },
      {
        name: 'A heavy week of reading',
        ui: 'heavy-week',
        mechanic:
          'When someone passes 90 minutes and 5 reading days in the last 7 days, Apple’s sheet opens on its own the next time they finish an article and land back on the feed. Apple itself suggests timing the ask by how often people use the app.',
        trigger: 'Weekly reading bars crossed, back on the feed',
        why: 'Time spent is the most honest sign someone likes the app.',
        risk: 'low',
        riskNote: 'Never mid-article. Tune the bars in GrowthBook.',
        pick: true,
      },
      {
        name: 'Joined a squad',
        mechanic:
          'After “complete joining squad”, fire on the first scroll back to the feed, not on the join itself.',
        trigger: 'Squad joined, about 70 iOS users a week',
        why: 'They chose to belong somewhere, and land on a fresh feed of their own people.',
        risk: 'low',
      },
      {
        name: 'Left a live chat',
        mechanic:
          'Fire when someone leaves a live chat on a trending post, never during it.',
        trigger: '“join live chat”, about 55 iOS users a week',
        why: 'Live with other developers while news breaks: the most social moment in the product.',
        risk: 'low',
      },
      {
        name: 'Your squad grew',
        mechanic:
          'After a squad_member_joined notification is opened, once they leave the squad page. Never as the app launches from the push.',
        trigger: 'Squad admins, about 19 iOS users a week',
        why: 'They watch something they built grow.',
        risk: 'low',
      },
      {
        name: 'New follower',
        mechanic:
          'After a user_follow notification is opened, once they leave the new follower’s profile.',
        trigger: 'About 12 iOS users a week',
        why: 'A peer recognizing them personally counts for more than a vote.',
        risk: 'low',
      },
      {
        name: 'Your feature request shipped',
        mechanic:
          'After a feedback_resolved notification on a Feature Request is opened, once they leave the thread.',
        trigger: 'About 15 iOS users a week',
        why: 'Real people listened and built it: the strongest “they care” moment.',
        risk: 'low',
        riskNote:
          'Feature requests only. A resolved bug report is still close to an error.',
      },
      {
        name: 'Plus members, after they renew',
        ui: 'plus-members',
        mechanic:
          'After the first renewal, and on the Plus anniversary, a thank-you sheet shows what Plus did for them that month when they come back to the feed from an article. After a short pause, Apple’s sheet opens on its own over it. “Gift Plus to a friend” is the sheet’s button.',
        trigger: 'First article after the first renewal, Plus anniversary',
        why: 'Paying members already decided daily.dev is worth it, and renewing is the proof.',
        risk: 'low',
        riskNote:
          'Never on checkout or paywall screens, never after a failed payment, and no perk for rating.',
        pick: true,
      },
      {
        name: 'Third bookmark or upvote',
        mechanic:
          'On the third bookmark or upvote in one session, prompt at the next pause, once they scroll on, not as a result of the tap.',
        trigger: 'In-session engagement counter',
        why: 'Fires often and marks an engaged session.',
        risk: 'low',
        riskNote: 'Can burn the shot before a better moment. Rank it low.',
      },
      {
        name: 'After a quest reward',
        mechanic: 'Prompt after the quest reward screen closes.',
        trigger: 'Quest reward claimed',
        why: 'A fresh win and a good mood.',
        risk: 'medium',
        riskNote:
          'Timing only. A "rate the app" quest, or Cores/reputation for reviewing, is a clear 5.6.1 violation.',
      },
    ],
  },
  {
    title: 'Asks people start themselves',
    subtitle:
      'Always there in the app for anyone who wants to rate. Apple’s advice: a persistent link to the write-a-review page, never the system prompt behind a button.',
    ideas: [
      {
        name: 'Permanent "Rate daily.dev" row',
        ui: 'rate-row',
        mechanic:
          'A row in the profile menu that calls review-open-store, opening the App Store’s “Write a Review” sheet. Apple recommends exactly this link in settings, and says not to call the system prompt from a tap because it may show nothing.',
        trigger: 'Always visible, user-started',
        why: 'Always there for people who want to rate, and it never uses up the yearly prompt.',
        risk: 'low',
        pick: true,
      },
    ],
  },
  {
    title: 'Plumbing that makes it all work',
    subtitle: 'Not hacks on their own, but every idea above depends on them.',
    ideas: [
      {
        name: 'Only prompt in good sessions',
        mechanic:
          'Send review-request only if this session had no errors, no slow load (>3s), no failed request, no paywall view or failed payment, and the account is 3+ days old with 3+ sessions. Never at launch or during onboarding, as Apple advises.',
        why: 'One bad moment and the prompt is gone for the year. People who just hit a bug or a paywall leave the 1–2★s. This is choosing when, not asking how they feel, so it is not gating.',
        risk: 'low',
        pick: true,
      },
      {
        name: 'Track the shot on the server',
        mechanic:
          'Log review_prompt_requested with the trigger name, keep the 120-day cooldown per user across devices, ask at most once per app version (as Apple’s own sample does), and A/B which trigger goes first in GrowthBook.',
        why: 'With ~1 shot a year per user, learn which moment earns the most ratings.',
        risk: 'low',
      },
      {
        name: 'Same thing on Android',
        mechanic:
          'Build the bridge in dailydotdev/android with Play’s In-App Review API and reuse the web triggers.',
        why: 'One web change feeds both stores.',
        risk: 'low',
        riskNote: 'Google bans "do you like us?" before the prompt too.',
      },
    ],
  },
];

const riskStyle: Record<Risk, { label: string; className: string }> = {
  low: {
    label: 'Safe',
    className: 'bg-accent-avocado-flat text-accent-avocado-default',
  },
  medium: {
    label: 'Medium',
    className: 'bg-accent-cheese-flat text-accent-cheese-default',
  },
  gray: {
    label: 'Gray area',
    className: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  },
};

const stats = [
  { value: '4.41★', label: '244 ratings, all storefronts' },
  { value: '4.34★', label: '41 ratings in the US' },
  { value: '1.5k–2.9k', label: 'US ratings at Octal, HACK, feeeed' },
  { value: '0', label: 'web calls to the iOS review bridge' },
];

const firstSteps = [
  'Wire the web half: add review-request and review-open-store to ios.ts, then ship the streak trigger, the Rate daily.dev row and the good-session check.',
  'Test the 1.26 bridge on a real device.',
];

const RiskBadge = ({ risk }: { risk: Risk }): ReactElement => (
  <span
    className={classNames(
      'rounded-8 px-2 py-0.5 font-bold typo-caption1',
      riskStyle[risk].className,
    )}
  >
    {riskStyle[risk].label}
  </span>
);

const IdeaCard = ({
  idea,
  index,
}: {
  idea: Idea;
  index: number;
}): ReactElement => (
  <article
    className={classNames(
      'flex flex-col gap-3 rounded-16 border bg-background-subtle p-5',
      idea.pick
        ? 'border-accent-cabbage-default'
        : 'border-border-subtlest-tertiary',
    )}
  >
    <header className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-8 bg-surface-float font-bold text-text-tertiary typo-footnote">
        {index}
      </span>
      <h3 className="flex-1 font-bold text-text-primary typo-body">
        {idea.name}
      </h3>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <RiskBadge risk={idea.risk} />
        {idea.pick && (
          <span className="font-bold text-accent-cabbage-default typo-caption1">
            Do first
          </span>
        )}
      </div>
    </header>
    <p className="text-text-primary typo-callout">{idea.mechanic}</p>
    {idea.trigger && (
      <p className="text-text-tertiary typo-footnote">
        <span className="font-bold text-text-secondary">Trigger: </span>
        {idea.trigger}
      </p>
    )}
    <p className="text-text-secondary typo-footnote">
      <span className="font-bold">Why it works: </span>
      {idea.why}
    </p>
    {idea.riskNote && (
      <p className="rounded-10 bg-surface-float px-3 py-2 text-text-tertiary typo-footnote">
        {idea.riskNote}
      </p>
    )}
    {idea.ui && (
      <a
        href={`/?path=/story/app-store-review-surfaces--${idea.ui}`}
        target="_top"
        className="mt-auto font-bold text-accent-cabbage-default typo-footnote hover:underline"
      >
        See the UI →
      </a>
    )}
  </article>
);

// The moment the top pick fires: the streak celebration has closed and the
// native rating sheet sits over the feed.
const PromptMock = (): ReactElement => (
  <div className="relative mx-auto flex h-[30rem] w-60 shrink-0 flex-col overflow-hidden rounded-32 border-4 border-border-subtlest-secondary bg-background-default">
    <div className="flex flex-col gap-3 p-4">
      {[0, 1, 2].map((card) => (
        <div
          key={card}
          className="flex flex-col gap-2 rounded-12 bg-surface-float p-3"
        >
          <span className="h-2.5 w-10/12 rounded-4 bg-background-subtle" />
          <span className="h-2.5 w-6/12 rounded-4 bg-background-subtle" />
          <span className="h-16 rounded-8 bg-background-subtle" />
        </div>
      ))}
    </div>
    <div className="absolute inset-0 flex items-center justify-center bg-overlay-quaternary-onion p-4">
      <div className="flex w-full flex-col items-center gap-2 rounded-16 bg-background-popover p-4 text-center">
        <span className="flex size-10 items-center justify-center rounded-10 bg-background-default">
          <LogoIcon className={{ container: 'size-6' }} />
        </span>
        <p className="font-bold text-text-primary typo-callout">
          Enjoying daily.dev?
        </p>
        <p className="text-text-tertiary typo-caption1">
          Tap a star to rate it on the App Store.
        </p>
        <p className="tracking-widest text-accent-cabbage-default typo-title3">
          ★★★★★
        </p>
        <span className="w-full border-t border-border-subtlest-tertiary pt-2 text-accent-cabbage-default typo-callout">
          Not Now
        </span>
      </div>
    </div>
    <p className="absolute bottom-3 left-0 right-0 text-center text-text-quaternary typo-caption2">
      Apple’s own sheet, after the 30-day streak closes
    </p>
  </div>
);

type Filter = 'all' | Risk | 'pick';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All ideas' },
  { id: 'pick', label: 'Do first' },
  { id: 'low', label: 'Safe' },
  { id: 'medium', label: 'Medium' },
  { id: 'gray', label: 'Gray area' },
];

const ReviewHacksBoard = (): ReactElement => {
  const [filter, setFilter] = useState<Filter>('all');
  const matches = (idea: Idea): boolean =>
    filter === 'all' ||
    (filter === 'pick' ? !!idea.pick : idea.risk === filter);
  let count = 0;

  return (
    <div className="min-h-screen bg-background-default px-4 py-10 tablet:px-10">
      <div className="mx-auto flex max-w-[75rem] flex-col gap-10">
        <section className="flex flex-col gap-8 laptop:flex-row laptop:items-center">
          <div className="flex flex-1 flex-col gap-5">
            <span className="font-bold uppercase text-accent-cabbage-default typo-footnote">
              Mission: more App Store reviews
            </span>
            <h1 className="font-bold text-text-primary typo-large-title">
              The prompt is built. Nobody fires it.
            </h1>
            <p className="max-w-[40rem] text-text-secondary typo-body">
              iOS 1.26 (live Oct 30) ships a native bridge with review-request
              and review-open-store, but the webapp never calls either. How many
              ratings we have matters more than the average, so the biggest hack
              is wiring it up and spending the one shot a year on the best
              moment. Every idea below came out of the session with Agent Smith.
            </p>
            <a
              href="/?path=/story/app-store-review-surfaces--all-surfaces"
              target="_top"
              className="w-fit font-bold text-accent-cabbage-default typo-callout hover:underline"
            >
              See every surface in production UI →
            </a>
            <a
              href="/?path=/story/app-store-review-build-spec--spec"
              target="_top"
              className="w-fit font-bold text-accent-cabbage-default typo-callout hover:underline"
            >
              Read the build spec →
            </a>
            <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 rounded-16 bg-surface-float p-4"
                >
                  <span className="font-bold text-text-primary typo-title2">
                    {stat.value}
                  </span>
                  <span className="text-text-tertiary typo-footnote">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <PromptMock />
        </section>

        <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-5">
          <h2 className="font-bold text-text-primary typo-title3">
            Rules for every idea
          </h2>
          <ul className="flex flex-col gap-1 text-text-secondary typo-callout">
            <li>Only Apple’s system prompt inside the app, no custom stars.</li>
            <li>
              The prompt fires on its own at a natural break, never from a
              button: Apple says it may not show. Buttons and rows open the
              write-a-review page instead.
            </li>
            <li>
              Never at launch or during onboarding, at most once per app
              version, 120 days apart (Apple caps it at 3 a year).
            </li>
            <li>
              No “Enjoying daily.dev?” question that sends only happy people to
              the prompt (review gating).
            </li>
            <li>
              No reward of any kind for reviewing: Cores, reputation, featuring,
              quests (guideline 5.6.1).
            </li>
            <li>
              Ask at the emotional peak, never right after a paywall, a bug or a
              slow load. One bad moment loses the prompt for the year.
            </li>
          </ul>
        </section>

        <div className="sticky top-0 z-1 -mx-4 flex flex-wrap gap-2 bg-background-default px-4 py-3 tablet:-mx-10 tablet:px-10">
          {filters.map((option) => (
            <Button
              key={option.id}
              type="button"
              size={ButtonSize.Small}
              variant={
                filter === option.id
                  ? ButtonVariant.Primary
                  : ButtonVariant.Float
              }
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {groups.map((group) => {
          const ideas = group.ideas.map((idea) => {
            count += 1;
            return { idea, index: count };
          });
          const visible = ideas.filter(({ idea }) => matches(idea));
          if (!visible.length) {
            return null;
          }
          return (
            <section key={group.title} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-text-primary typo-title2">
                  {group.title}
                </h2>
                <p className="max-w-[48rem] text-text-tertiary typo-callout">
                  {group.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptopL:grid-cols-3">
                {visible.map(({ idea, index }) => (
                  <IdeaCard key={idea.name} idea={idea} index={index} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="flex flex-col gap-4 rounded-16 bg-surface-float p-6">
          <h2 className="font-bold text-text-primary typo-title2">
            What to do first
          </h2>
          <ol className="flex flex-col gap-3">
            {firstSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-cabbage-default font-bold text-white typo-footnote">
                  {index + 1}
                </span>
                <span className="text-text-primary typo-callout">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Growth/App Store reviews',
  id: 'app-store-review-hacks',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Ideas: StoryObj = {
  render: () => <ReviewHacksBoard />,
};

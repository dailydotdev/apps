import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Growth/Reading reminder hero/3. Dev spec',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// What a developer needs to build the proposal: the rules today, what
// changes, the data and backend work behind each change, and what to test.
// Paths are relative to packages/shared/src.

const Section = ({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section id={id} className="flex flex-col gap-3">
    <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
    {intro && (
      <p className="max-w-[48rem] text-text-secondary typo-callout">{intro}</p>
    )}
    {children}
  </section>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[44rem] border-collapse text-left typo-footnote">
      <thead className="bg-background-subtle">
        <tr>
          {head.map((cell) => (
            <th
              key={cell}
              className="border-b border-border-subtlest-tertiary px-3 py-2 font-bold text-text-primary"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={rowIndex} className="align-top">
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className="border-b border-border-subtlest-tertiary px-3 py-2 text-text-secondary"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Paths may wrap after a slash, never inside a name.
const Code = ({ children }: { children: ReactNode }): ReactElement => (
  <code className="rounded-4 bg-surface-float px-1 text-text-primary">
    {typeof children === 'string'
      ? children.replaceAll('/', '/\u200b')
      : children}
  </code>
);

const Tag = ({ kind }: { kind: 'same' | 'new' | 'changed' }): ReactElement => {
  const styles = {
    same: 'bg-surface-float text-text-tertiary',
    new: 'bg-accent-cabbage-default text-white',
    changed: 'bg-accent-bun-default text-white',
  };
  const labels = {
    same: 'Same',
    new: 'New',
    changed: 'Changed',
  };
  return (
    <span
      className={`whitespace-nowrap rounded-6 px-1.5 py-0.5 font-bold typo-caption2 ${styles[kind]}`}
    >
      {labels[kind]}
    </span>
  );
};

const List = ({ items }: { items: ReactNode[] }): ReactElement => (
  <ul className="flex max-w-[48rem] list-disc flex-col gap-1.5 pl-5 text-text-secondary typo-callout">
    {items.map((item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const Pseudo = ({ children }: { children: string }): ReactElement => (
  <pre className="max-w-[48rem] overflow-x-auto rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 text-text-secondary typo-footnote">
    {children}
  </pre>
);

const toc = [
  ['scope', 'Scope and files'],
  ['who', '1. Who sees it'],
  ['devices', '2. Devices and surfaces'],
  ['push', '3. Push before saving'],
  ['hour', '4. The hour'],
  ['close', '5. Close everywhere'],
  ['theme', '6. Light theme'],
  ['copy', '7. Copy and the flag'],
  ['analytics', '8. Analytics'],
  ['art', '9. Art'],
  ['backend', '10. Confirmed with the backend'],
  ['questions', '11. Decisions'],
  ['qa', '12. QA matrix'],
];

export const DevSpec: StoryObj = {
  name: 'Dev spec',
  render: () => (
    <div className="mx-auto flex max-w-[64rem] flex-col gap-10 px-4 py-10 tablet:px-8">
      <header className="flex flex-col gap-3">
        <span className="text-text-tertiary typo-footnote">
          Growth · reading reminder hero · for developers
        </span>
        <h1 className="font-bold text-text-primary typo-large-title">
          Dev spec
        </h1>
        <p className="max-w-[48rem] text-text-secondary typo-body">
          Everything the proposal needs in production, checked against the code
          on main. Paths are relative to <Code>packages/shared/src</Code>. The
          product questions are answered in 11. Decisions.
        </p>
        <nav className="flex flex-wrap gap-2">
          {toc.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-10 bg-surface-float px-2.5 py-1 text-text-secondary typo-footnote hover:text-text-primary"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Section
        id="scope"
        title="Scope and files"
        intro="Same slots, same flow entry points. No new surface, no new query on page load."
      >
        <Table
          head={['File', 'Change']}
          rows={[
            [
              <Code key="f">
                hooks/notifications/useReadingReminderHero.ts
              </Code>,
              'Hour from now, push before saving, push-supported gate, account-level close, and the last-seen stamp written only when the card is on screen. useReadingReminderHeroSettled waits for the account-level close too, so Weekly picks keeps landing with it.',
            ],
            [
              <Code key="f">
                hooks/notifications/useReadingReminderFeedHero.ts
              </Code>,
              'Pass the step state and the new handlers through; keep the paused prompt first; call useReadingReminderHero with enabled: !disableTopHero.',
            ],
            [
              <Code key="f">
                components/marketing/banners/ReadingReminderFeedHero.tsx
              </Code>,
              'Phone and tablet card: today’s layout (centered on phones, row on tablets) with Patchy, tokens and all steps.',
            ],
            [
              <Code key="f">
                components/marketing/banners/HeroBottomBanner.tsx
              </Code>,
              'TopHero is shared with the CV card. Keep its layout for the laptop card, but it puts a small title over a bold subtitle, and the new copy is bold title over a small line: add a variant or a sibling component rather than changing the CV card.',
            ],
            [
              <Code key="f">components/Feed.tsx</Code>,
              'Keeps its layout branch, but renders the new laptop card in the strip instead of TopHero.',
            ],
            [
              <Code key="f">
                components/onboarding/FeedPatchy/useFeedPatchyReminder.ts
              </Code>,
              'Already tells granted, denied and dismissed apart: reuse it with saving moved after the answer (see 3).',
            ],
            [
              <Code key="f">contexts/PushNotificationContext.tsx</Code>,
              'iOS push-subscribe has no timeout (see 3).',
            ],
            [
              <Code key="f">graphql/actions.ts</Code>,
              'New ActionType for the close.',
            ],
            [
              <Code key="f">lib/featureManagement.ts</Code>,
              'A new experiment flag, default false (see 11). reading_reminder_hero_copy is archived: see 7.',
            ],
            [
              <Code key="f">components/MainFeedLayout.tsx</Code>,
              'Add picksHero.shouldShow to disableTopHero, held for the rest of the visit once Weekly picks has shown, so the reminder never shows with it or right after it.',
            ],
            [<Code key="f">lib/image.ts</Code>, 'cloudinaryPatchyReading.'],
            [
              'daily-api src/cio.ts',
              'Backend: stop saving a reading or streak reminder from re-subscribing the email digest (see 11).',
            ],
            [
              <Code key="f">lib/log.ts</Code>,
              'New events or extra fields: see 8.',
            ],
            [
              'Tests',
              <>
                <Code>useReadingReminderHero.spec.tsx</Code>,{' '}
                <Code>useReadingReminderFeedHero.spec.tsx</Code>,{' '}
                <Code>ReadingReminderFeedHero.spec.tsx</Code>,{' '}
                <Code>Feed.spec.tsx</Code> assert today’s order (save, then
                push) and the 9 AM hour, and will need updating.
              </>,
            ],
          ]}
        />
      </Section>

      <Section
        id="who"
        title="1. Who sees it"
        intro={
          <>
            All of these must hold. Today’s rules live in{' '}
            <Code>useReadingReminderHero.ts</Code> and{' '}
            <Code>useReadingReminderFeedHero.ts</Code>.
          </>
        }
      >
        <Table
          head={['Rule', 'Today', 'Proposed', '']}
          rows={[
            ['Logged in', 'Yes', 'Yes', <Tag key="t" kind="same" />],
            [
              'Page',
              <>
                Home feed only: <Code>pathname === webappUrl</Code>.
              </>,
              'Same',
              <Tag key="t" kind="same" />,
            ],
            [
              'Extension new tab',
              <>
                Never shows: the extension’s <Code>webappUrl</Code> is a full
                URL and its router’s pathname is <Code>/</Code>, so the page
                check never passes.
              </>,
              'Keep it out: the extension has no push provider and would open a popup window.',
              <Tag key="t" kind="same" />,
            ],
            [
              'No reading reminder saved',
              'Yes',
              'Yes',
              <Tag key="t" kind="same" />,
            ],
            [
              'Not on the signup day',
              <Code key="c">getIsRegisteredToday</Code>,
              'Same',
              <Tag key="t" kind="same" />,
            ],
            [
              'Not closed',
              'Stored in IndexedDB (ReadingReminderLastSeen = "dismissed"), so per device and per browser.',
              'Stored on the account (see 5). Also honor the old local value so nobody who closed it sees it again.',
              <Tag key="t" kind="changed" />,
            ],
            [
              'At most once a day',
              <>
                Per device, and the last-seen stamp is written whenever the
                reader is eligible, on any feed (<Code>useFeed.ts</Code> calls
                the hook for every feed), so the day can be used up on another
                feed without the card ever showing.
              </>,
              'Stamp it only when the card is actually on screen.',
              <Tag key="t" kind="changed" />,
            ],
            [
              'Push can work here',
              <>
                Not checked. On iOS Safari outside an installed app, or when
                OneSignal fails to load, the hero still saves a reminder that
                can’t arrive.
              </>,
              <>
                Show only when <Code>isPushSupported</Code> (or already
                subscribed). Same gate the paused prompt already uses.
              </>,
              <Tag key="t" kind="new" />,
            ],
            [
              'Paused-reminder prompt',
              'Takes the slot first when the saved reminder is paused and push is off.',
              'Same, in the new layout.',
              <Tag key="t" kind="same" />,
            ],
            [
              'Width',
              <>
                Every width (<Code>requireMobile: false</Code>).
              </>,
              'Same',
              <Tag key="t" kind="same" />,
            ],
            [
              'Other top cards win',
              <>
                <Code>disableTopHero</Code> hides it when the feed hero (
                <Code>featureFeedHero</Code>, without feed widgets) is on, and
                while Weekly picks is still deciding (
                <Code>MainFeedLayout.tsx</Code>). On phones and tablets it also
                gives way to any other top content of the feed.
              </>,
              'Same',
              <Tag key="t" kind="same" />,
            ],
            [
              'Weekly picks is showing',
              'Both show: stacked above the feed below laptop, side by side in the strip on laptop.',
              <>
                Hidden while Weekly picks is on screen: add{' '}
                <Code>picksHero.shouldShow</Code> to <Code>disableTopHero</Code>{' '}
                in <Code>MainFeedLayout.tsx</Code>. That also hides the paused
                prompt and its impression. Keep it hidden for the rest of the
                visit once Weekly picks has shown (closing or picking would
                otherwise pop the reminder in), and pass{' '}
                <Code>enabled: !disableTopHero</Code> to{' '}
                <Code>useReadingReminderHero</Code> so a hidden day isn’t used
                up. The reminder comes back on a later visit.
              </>,
              <Tag key="t" kind="new" />,
            ],
          ]}
        />
      </Section>

      <Section
        id="devices"
        title="2. Devices and surfaces"
        intro="Native iOS and Android run the webapp shell, so they get whichever layout their screen width gets: phones the phone card, tablets the tablet card. The platform comes from getDailyClientPlatform, never from an extension or webapp flag."
      >
        <Table
          head={['Surface', 'Card today', 'Card proposed', 'Push path']}
          rows={[
            [
              'Phone web (< 656px)',
              'ReadingReminderFeedHero, stacked, cat below',
              'Stacked, Patchy 128px',
              'OneSignal web push. iOS Safari outside an installed app: unsupported, so the card is hidden.',
            ],
            [
              'Tablet web (656–1019px)',
              'ReadingReminderFeedHero, left-aligned row, cat right',
              'Today’s row: copy left, Patchy in the art panel on the right, same 228px height',
              'OneSignal',
            ],
            [
              'Laptop (≥ 1020px, useLaptopLayout)',
              <>
                TopHero in the top-hero strip above the feed frame (
                <Code>MainLayout.tsx</Code>).
              </>,
              'Today’s row layout in the same strip (art left, copy and buttons right), same 130px height, new art, copy and states. Must also work at half width, see below.',
              'OneSignal',
            ],
            [
              'iOS app',
              'By width (phone card on iPhone)',
              'By width',
              <>
                Native bridge <Code>push-subscribe</Code>, answers a boolean. No
                “denied” state and no timeout.
              </>,
            ],
            [
              'Android app',
              'By width',
              'By width',
              'OneSignal web push inside the Chrome shell (no native path).',
            ],
            ['Extension', 'Not shown', 'Not shown', 'None'],
          ]}
        />
        <List
          items={[
            <>
              <strong className="text-text-primary">Weekly picks:</strong>{' '}
              <Code>WeeklyPicksHeroCard</Code> (#7316, team-only today) never
              shows with the reminder: when it’s on screen the reminder is
              hidden (see 1). Its phone and tablet panel copies today’s dark
              reminder panel, light-theme bug included; that is its own fix now,
              not part of this change. See All cases · Weekly picks wins.
            </>,
            <>
              <strong className="text-text-primary">Shared strip:</strong> on
              laptop the strip can also hold the upload-CV card, and splits into
              two columns when two show (
              <Code>tablet:has-[&gt;:nth-child(2)]:grid-cols-2</Code>). The
              reminder already waits for Weekly picks to decide (
              <Code>isAwaitingPicksHero</Code>), so hiding it behind Weekly
              picks adds no new wait. The laptop card has to fit about 440px;
              Flow · All states shows every state at that width.
            </>,
            <>
              <strong className="text-text-primary">Phones and tablets:</strong>{' '}
              the inline card only shows when the feed has no other top content
              (<Code>Feed.tsx</Code>). <Code>keepTopHero</Code> would keep it,
              but no production caller sets it; only tests do.
            </>,
          ]}
        />
      </Section>

      <Section
        id="push"
        title="3. Push before saving"
        intro="Today the hero saves the reminder, then asks for push and ignores the answer. Proposed: nothing is saved until push is on."
      >
        <Pseudo>{`onSend(hour)
  if isSubscribed                      → save(hour) → "saved"
  if web && Notification.permission === 'denied'
                                       → "blocked" (nothing saved)
  granted = await onEnablePush(source)   // permission is not denied here, so it asks
  if granted                           → save(hour) → "saved"
  else if web && Notification.permission === 'denied'
                                       → "blocked" (nothing saved)
  else if iOS app                      → "blocked" (iOS has no dismiss)
  else                                 → back to "offer" (dismissed, nothing saved)`}</Pseudo>
        <List
          items={[
            <>
              <Code>onEnablePush</Code> returns one boolean: false covers
              denied, dismissed, unsupported, OneSignal not loaded and “popup
              opened”. When web permission is already denied it opens the{' '}
              <Code>/popup/notifications/enable</Code> window instead of asking.
              So check permission first, as in the pseudo code.
            </>,
            <>
              <Code>
                components/onboarding/FeedPatchy/useFeedPatchyReminder.ts
              </Code>{' '}
              already returns granted, denied or dismissed and logs{' '}
              <Code>ReadingReminderPermission</Code>, but it saves before
              asking. Reuse it with the order flipped rather than writing a
              third version.
            </>,
            <>
              Blocked state: show{' '}
              <Code>
                components/onboarding/FeedPatchy/ReEnableNotifications.tsx
              </Code>
              . It already has steps for the iOS app, Android app, Android web,
              Chrome, Edge, Firefox, Opera and Safari.
            </>,
            <>
              iOS app: <Code>push-subscribe</Code> has no timeout, and a second
              call leaves the first promise hanging. Add a timeout so the card
              can’t stick on “Waiting for your answer”.
            </>,
            <>
              Saved: the card shows “You’re all set” for about 2.5s, then
              leaves. Mark it seen so it doesn’t come back that day.
            </>,
          ]}
        />
      </Section>

      <Section
        id="hour"
        title="4. The hour"
        intro="Tsahi’s copy means the hour the reader sees the card (“when you’re reading now”), not a computed habit. No new data is needed."
      >
        <List
          items={[
            <>
              The hour now in the reader’s timezone, rounded down:{' '}
              <Code>getHourTimezone(getUserInitialTimezone(…))</Code> from{' '}
              <Code>lib/timezones.ts</Code>. Today it’s a hard-coded{' '}
              <Code>DEFAULT_READING_REMINDER_HOUR = 9</Code>.
            </>,
            'The backend serves each hour from a run at :50 of the hour before, so a reminder arrives today only if it’s saved before then (saved at 1:30 PM for 2 PM: today; at 1:55 PM: tomorrow). At the current hour it’s always tomorrow; the saved copy says which.',
            <>
              <Code>getHourTimezone</Code> formats with{' '}
              <Code>hour12: false</Code>, which can return 24 at midnight: take
              it modulo 24.
            </>,
            'Between midnight and 5 AM the card offers 9 AM instead of the current hour, and drops “when you’re reading now” from the subtitle (see 11).',
            '“Other time” offers 9 AM, 1 PM and 8 PM, with the offered hour in place of the nearest one, with sun and moon icons as in the mockup. Times read the same way everywhere on the card: “8 PM”.',
            <>
              <Code>subscribePersonalizedDigest</Code> sends <Code>hour</Code>,{' '}
              <Code>day</Code>, <Code>type</Code> and <Code>sendType</Code>, but
              no timezone; the backend uses the profile’s timezone. The client’s
              fallback (<Code>user.timezone ?? device</Code>) only goes into the
              log today.
            </>,
            'If the profile has no timezone, the backend treats the hour as UTC, so “8 PM” can arrive at 8 PM UTC. Save the device timezone to the profile before saving the reminder when it’s empty.',
            'For reference: there is no client query for reads by hour of day. A habit-based hour would need a new backend field.',
          ]}
        />
      </Section>

      <Section
        id="close"
        title="5. Close everywhere"
        intro="23% of people who closed it saw it again, because the close is stored per device."
      >
        <List
          items={[
            <>
              Add an ActionType (e.g. <Code>DismissReadingReminderHero</Code>)
              and call <Code>completeAction</Code> on close. Read it with{' '}
              <Code>checkHasCompleted</Code>, as the brief card does in{' '}
              <Code>Feed.tsx</Code> (<Code>DismissBriefCard</Code>).
            </>,
            <>
              Actions are not in boot: <Code>useActions</Code> fetches once the
              shell has settled. Don’t show the hero until{' '}
              <Code>isActionsFetched</Code>, or it flashes for people who closed
              it. Fold that into <Code>useReadingReminderHeroSettled</Code>,
              which the strip waits on.
            </>,
            'Keep reading the old IndexedDB "dismissed" value, and complete the action when it’s found, so past closes carry over.',
            'No backend change needed: completeAction stores any string (daily-api src/schema/actions.ts). Adding the type to the backend’s UserActionType is optional tidy-up.',
          ]}
        />
      </Section>

      <Section id="theme" title="6. Light theme">
        <List
          items={[
            <>
              <Code>ReadingReminderFeedHero</Code> uses{' '}
              <Code>bg-raw-pepper-90</Code>, <Code>text-white</Code> and pepper
              gradient fades, next to theme-driven parts like the primary
              button. In light theme its small title line (“Never miss a
              learning day”) and the button’s background disappear on the dark
              card (Before and after · Themes).
            </>,
            'Replace them with semantic tokens (bg-background-default, text-text-primary, text-text-tertiary). TopHero already uses tokens.',
            <>
              <strong className="text-text-primary">
                One look on every width:
              </strong>{' '}
              every card uses the top-hero strip’s frame (
              <Code>
                rounded-16 border border-border-subtlest-quaternary
                bg-background-default
              </Code>
              ), the same as TopHero, the CV card and Weekly picks on laptop,
              with no gradient border, glow or open bottom edge. All buttons,
              time choices included, are Small; the close button is Small. Only
              the layout and type sizes change with the width. At half width on
              laptop the time choices wrap rather than shrink.
            </>,
            'Check both themes on phone, tablet and laptop, and in the iOS and Android apps.',
          ]}
        />
      </Section>

      <Section id="copy" title="7. Copy and the flag">
        <List
          items={[
            <>
              Title and subtitle come from{' '}
              <Code>reading_reminder_hero_copy</Code> (default: “Never miss a
              learning day” / “Turn on your daily reading reminder and keep your
              routine.”). The flag was archived on 2026-10-11 with no rules, so
              production serves this default.
            </>,
            'The new subtitle has the hour in it: put the copy in code, behind the new experiment flag (see 11), rather than in a flag value.',
            <>
              Copy per step is in Flow · All states. Its promises, one top pick
              a day and skipped on days you’ve read, match the backend (see 10).
            </>,
          ]}
        />
      </Section>

      <Section id="analytics" title="8. Analytics">
        <Table
          head={['Moment', 'Today', 'Proposed']}
          rows={[
            [
              'Card shown',
              'ImpressionNotificationCta, target “reading reminder”, placement top-hero',
              'Same. Add the step to extra when it isn’t the offer (paused prompt already has its own kind).',
            ],
            [
              'Send tapped',
              'ClickNotificationCta',
              'Same, plus hour and source: "now" or "picked".',
            ],
            ['Other time opened', '—', 'New click event.'],
            [
              'Push answer',
              'Grants are logged by the push provider (ClickEnableNotification, origin reading reminder). Denied and dismissed are not logged.',
              'Also log denied and dismissed: ReadingReminderPermission, as useFeedPatchyReminder does.',
            ],
            [
              'Reminder saved',
              'schedule reading reminder, extra { hour: 9, timezone }',
              'Same event, real hour, only after push is on.',
            ],
            ['Closed', 'ClickNotificationDismiss', 'Same.'],
          ]}
        />
      </Section>

      <Section id="art" title="9. Art">
        <List
          items={[
            'Reading Patchy lying on a cushion with an open book, made with Agent Smith; on-model against patchy-waiting.',
            <>
              Upload it to media.daily.dev and add{' '}
              <Code>cloudinaryPatchyReading</Code> to <Code>lib/image.ts</Code>.
              In this PR it’s served from Storybook’s public folder.
            </>,
            'Trimmed to the art, shown 128px tall on phones, filling the 14.5rem art panel on tablets, and in TopHero’s 128×112px art box on laptop (about 97px tall); the WebP is 274px tall for 2x screens.',
          ]}
        />
      </Section>

      <Section
        id="backend"
        title="10. Confirmed with the backend"
        intro="Answers from the daily-api code (main, read 2026-11-24 with Agent Smith; the skip check and completeAction spot-checked on GitHub)."
      >
        <Table
          head={['Question', 'Answer']}
          rows={[
            [
              'Skipped on days they’ve read?',
              'Yes. Any post view that day sets the streak’s lastViewAt, in the profile timezone (UTC if empty). The check runs at :50 of the hour before, so a read in the last ten minutes doesn’t stop it. A read before 3 AM can count toward yesterday instead. Readers with no streak row are never skipped.',
            ],
            [
              'What the push contains',
              '“Top pick for you” with the title of one post from their own feed, opening that post. Falls back to a generic message (for example “Your daily reading time”) when the feed is empty or the reminder was paused. It expires at local midnight.',
            ],
            [
              'Channels and pausing',
              'Push only, through OneSignal. When it can’t be delivered, deliveryPaused is set for 7 days, then one retry with the generic copy. A successful send, opting in to web push, or saving the reminder again clears it.',
            ],
            [
              'Hours and timezone',
              'Any hour 0–23, no quiet hours (those apply to the streak reminder only). Read in the profile timezone, UTC if empty. Leaving the hour out defaults to 9.',
            ],
            [
              'First send',
              'Today if saved before :50 of the hour before, else from tomorrow. The once-a-day check compares UTC days, so moving an already-sent reminder later the same day may not send again.',
            ],
            [
              'completeAction with a new type',
              'Accepted as is: the type is a free string. No backend change needed.',
            ],
          ]}
        />
      </Section>

      <Section
        id="questions"
        title="11. Decisions"
        intro="Answered by Agent Smith on 2026-11-24 from GrowthBook, the reminder data in the API and the brain. Each row says whether it rests on data or is a recommendation."
      >
        <Table
          head={['Question', 'Decision', 'Basis']}
          rows={[
            [
              'Late-night hours',
              'Between midnight and 5 AM, offer 9 AM instead of the current hour. From 5 AM, offer the current hour. Compare both in the experiment.',
              'Data: under 1% of reminders are set for midnight to 5 AM, and they get fewer taps (0.39%) than morning ones (0.57%, mostly 9 AM, where most readers are). Taps by hour are observational.',
            ],
            [
              '“Top pick” next to “Weekly picks”',
              'Keep “top pick”. Rename only if Weekly picks rolls out to readers.',
              'The push is titled “Top pick for you”; Weekly picks is team-only today. Recommendation.',
            ],
            [
              'Saving re-subscribes the email digest',
              'Not intended. Fix it in daily-api before rollout: skip both Customer.io calls for reading_reminder and streak_reminder. The hero can’t avoid it on its own.',
              'Code (src/cio.ts) and the brain, which notes it looks unintended. Saving any reminder also clears a global email unsubscribe. The fix is a recommendation.',
            ],
            [
              'Weekly picks and the reminder together',
              'Never together: while Weekly picks shows, the reminder is hidden. Its dark panel is fixed on its own, not in this change.',
              'Product decision (2026-11-24). Weekly picks is team-only today, so nothing changes for readers until it rolls out.',
            ],
            [
              'Experiment or rollout',
              'Experiment on a new flag that defaults to false (today’s hero is control). Primary metric: reminders saved with push allowed. Guardrail: day-over-day retention.',
              <>
                GrowthBook: <Code>reading_reminder_hero_copy</Code> was archived
                on 2026-10-11 with no rules. Past tests here were mixed (copy
                tests 1–4 lost; a dismissal change measured −6.7% retention).
                The metric choice is a recommendation, since push first will
                save fewer reminders.
              </>,
            ],
            [
              'Copy',
              'Keep Tsahi’s copy as the variant, and add an arm that keeps “Turn on your daily reading reminder…” in the subtitle.',
              'That line won five copy tests in a row; the winners of tests 5 and 6 were never made the default. Recommendation.',
            ],
          ]}
        />
      </Section>

      <Section
        id="qa"
        title="12. QA matrix"
        intro="Run each on phone web, laptop web, iOS app and Android app, in light and dark."
      >
        <Table
          head={['Case', 'Expected']}
          rows={[
            [
              'Eligible reader, push not yet asked',
              'Offer → system prompt → Allow → saved, reminder at the shown hour, card leaves.',
            ],
            ['Same, taps Block', 'Blocked state with steps; nothing saved.'],
            [
              'Same, closes the prompt (web)',
              'Back to the offer; nothing saved.',
            ],
            ['Push already allowed', 'No system prompt; saved straight away.'],
            [
              'Push already blocked (web)',
              'Blocked state on tap, no popup window; nothing saved.',
            ],
            ['iOS Safari, not installed', 'Card not shown.'],
            [
              '“Other time” → 1 PM',
              'Push flow as above; reminder saved at 1 PM.',
            ],
            [
              'Close on phone, open laptop',
              'Card not shown on laptop (after actions load, no flash).',
            ],
            [
              'Closed before this change (local value)',
              'Card not shown; the account action gets completed.',
            ],
            [
              'Reminder saved, push later turned off',
              'Paused prompt in the slot, new layout.',
            ],
            [
              'Weekly picks showing (phone and laptop)',
              'Only Weekly picks shows; no reminder card, no paused prompt and no reminder impression. Closing Weekly picks doesn’t bring the reminder in that visit, and the day isn’t used up: it can show on a later visit.',
            ],
            [
              'Profile has no timezone',
              'The device timezone is saved to the profile first; the reminder arrives at the shown local hour, not that hour in UTC.',
            ],
            ['Signup day', 'Card not shown.'],
            ['Extension new tab', 'Card not shown.'],
          ]}
        />
      </Section>
    </div>
  ),
};

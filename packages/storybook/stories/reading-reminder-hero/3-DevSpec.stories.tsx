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

const Tag = ({
  kind,
}: {
  kind: 'same' | 'new' | 'changed' | 'decide';
}): ReactElement => {
  const styles = {
    same: 'bg-surface-float text-text-tertiary',
    new: 'bg-accent-cabbage-default text-white',
    changed: 'bg-accent-bun-default text-white',
    decide: 'bg-accent-ketchup-default text-white',
  };
  const labels = {
    same: 'Same',
    new: 'New',
    changed: 'Changed',
    decide: 'Decide',
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
  ['questions', '10. Open questions'],
  ['qa', '11. QA matrix'],
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
          on main. Paths are relative to <Code>packages/shared/src</Code>. Items
          tagged <Tag kind="decide" /> need a product answer before building.
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
              'Pass the step state and the new handlers through; keep the paused prompt first.',
            ],
            [
              <Code key="f">
                components/marketing/banners/ReadingReminderFeedHero.tsx
              </Code>,
              'Phone and tablet card: centered, Patchy, tokens, all steps.',
            ],
            [
              <Code key="f">
                components/marketing/banners/HeroBottomBanner.tsx
              </Code>,
              'TopHero is shared with the CV card. Build the centered laptop card as its own component instead of changing TopHero.',
            ],
            [
              <Code key="f">components/Feed.tsx</Code>,
              'Keeps its layout branch, but renders the new laptop card in the strip instead of TopHero.',
            ],
            [
              <Code key="f">components/picks/WeeklyPicksHero.tsx</Code>,
              'Its phone and tablet panel copies today’s reminder panel: move it to the same frame and tokens (see 2).',
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
              'reading_reminder_hero_copy: see 7.',
            ],
            [<Code key="f">lib/image.ts</Code>, 'cloudinaryPatchyReading.'],
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
              'Stacked, Patchy 64px, subtitle on one line',
              'OneSignal',
            ],
            [
              'Laptop (≥ 1020px, useLaptopLayout)',
              <>
                TopHero in the top-hero strip above the feed frame (
                <Code>MainLayout.tsx</Code>).
              </>,
              'Centered laptop card in the same strip, ~130px tall. Must also work at half width, see below.',
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
              <strong className="text-text-primary">Weekly picks:</strong> below
              laptop, <Code>WeeklyPicksHeroCard</Code> (panel variant, #7316)
              renders above the feed, so it stacks on top of the reminder. Its
              panel is a copy of today’s reminder panel (
              <Code>bg-raw-pepper-90</Code>, <Code>text-white</Code>), so it has
              the same light-theme bug, and next to the new reminder it looks
              like a different product. Move it to the same frame and tokens in
              the same change. See All cases · Next to Weekly picks.
            </>,
            <>
              <strong className="text-text-primary">Shared strip:</strong> on
              laptop the strip also holds Weekly picks and the upload-CV card,
              and splits into two columns when two show (
              <Code>tablet:has-[&gt;:nth-child(2)]:grid-cols-2</Code>).
              <Code>useWeeklyPicksHero</Code> waits on{' '}
              <Code>useReadingReminderHeroSettled</Code> so they land together.
              The laptop card has to fit about 440px; Flow · All states shows
              every state at that width.
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
            'At the current hour the first reminder is tomorrow, since that hour is under way. A later hour picked under Other time can still arrive today; the saved copy says which.',
            <>
              <Code>getHourTimezone</Code> formats with{' '}
              <Code>hour12: false</Code>, which can return 24 at midnight: take
              it modulo 24.
            </>,
            '“Other time” offers 9 AM, 1 PM and 8 PM, with the current hour in place of the nearest one, with sun and moon icons as in the mockup. Times read the same way everywhere on the card: “8 PM”.',
            <>
              <Code>subscribePersonalizedDigest</Code> sends <Code>hour</Code>,{' '}
              <Code>day</Code>, <Code>type</Code> and <Code>sendType</Code>, but
              no timezone; the backend uses the profile’s timezone. The client’s
              fallback (<Code>user.timezone ?? device</Code>) only goes into the
              log today.
            </>,
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
              it. Fold that into <Code>useReadingReminderHeroSettled</Code> so
              Weekly picks still lands with it.
            </>,
            'Keep reading the old IndexedDB "dismissed" value, and complete the action when it’s found, so past closes carry over.',
            'Backend: confirm completeAction accepts the new type.',
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
              routine.”). Check GrowthBook for a running experiment before
              changing it.
            </>,
            'The new subtitle has the hour in it, so either move the copy into code and retire the flag, or give the flag value an {hour} placeholder.',
            <>
              Copy per step is in Flow · All states. It promises “Skipped on
              days you’ve read”; see 10.
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
            'Trimmed to the art, shown 128px tall on phones, 64px on tablets and 48px on laptop; the WebP is 274px tall for 2x screens.',
          ]}
        />
      </Section>

      <Section id="questions" title="10. Open questions">
        <Table
          head={['Question', 'Why it matters', 'Who', '']}
          rows={[
            [
              'Does the reading reminder skip days the reader already read?',
              'The copy promises it. No client code says so; it’s backend behavior.',
              'Backend',
              <Tag key="t" kind="decide" />,
            ],
            [
              'Is the reminder really “one top pick”?',
              'The copy promises a post from their feed. Confirm what the reading reminder push contains. “Pick” also overlaps with Weekly picks, which may confuse.',
              'Backend, product',
              <Tag key="t" kind="decide" />,
            ],
            [
              'Late-night hours (midnight to 5 AM)?',
              'Someone reading at 1 AM would get “Send it at 1 AM”. Keep, or suggest the next morning?',
              'Product',
              <Tag key="t" kind="decide" />,
            ],
            [
              'Tsahi’s lock-screen option',
              'His third image shows a lock-screen preview of the push instead of Patchy. Not built here.',
              'Product',
              <Tag key="t" kind="decide" />,
            ],
            [
              'Stay consistent with onboarding',
              'Onboarding settled on a time picker step and is dropping its push-only variant (PR 7175). Keep the hero’s time choice consistent with that step.',
              'Product',
              <Tag key="t" kind="decide" />,
            ],
            [
              'Weekly picks panel',
              'It copies today’s dark reminder panel. Restyle it with the reminder, or ship the reminder alone and accept the mismatch where both stack?',
              'Product',
              <Tag key="t" kind="decide" />,
            ],
            [
              'Experiment or straight rollout?',
              'The copy flag may already run an experiment. A new flag (default false) keeps today’s hero as control.',
              'Product',
              <Tag key="t" kind="decide" />,
            ],
          ]}
        />
      </Section>

      <Section
        id="qa"
        title="11. QA matrix"
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
              'Laptop with Weekly picks showing',
              'Both cards at half width, neither clipped, buttons on one line.',
            ],
            ['Signup day', 'Card not shown.'],
            ['Extension new tab', 'Card not shown.'],
          ]}
        />
      </Section>
    </div>
  ),
};

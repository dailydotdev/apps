import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Callout,
  CalloutTone,
  Cell,
  Mono,
  Page,
  PageHeader,
  PhoneFrame,
  Section,
  Table,
} from '../shell';
import { FrameStyles, FrameThumb } from '../frames';
import { handoffFrame } from '../catalog';
import { sampleData } from '../data';
import {
  HERO,
  NativePermission,
  NotificationCenter,
  NotificationRow,
  PermissionState,
  PromptTone,
  SettingsToggle,
  SoftPrompt,
  Timeline,
  Toast,
  Variant,
} from './mocks';

const meta: Meta = {
  title: 'Replay delivery/03. Turning notifications on',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Where and when to ask for push permission so next Monday reaches the lock screen, the two-step ask, and what happens when the browser says no.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const AfterTheDeck = (): React.ReactElement => (
  <PhoneFrame>
    <div
      className="relative flex h-[34rem] flex-col items-center justify-end overflow-hidden rounded-[1.75rem] p-4"
      style={{
        background:
          'radial-gradient(90% 60% at 50% 0%, rgba(206,61,243,.28) 0%, transparent 70%), var(--theme-background-default)',
      }}
    >
      <FrameStyles />
      <div className="absolute inset-x-0 top-5 flex flex-col items-center gap-2">
        <span className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((dot) => (
            <span key={dot} className="h-1.5 w-1.5 rounded-[999px] bg-text-primary" />
          ))}
        </span>
        <span className="text-text-quaternary typo-caption1">5 of 5 · that was week 37</span>
      </div>
      <div className="relative">
        <SoftPrompt
          headline="Get next Monday's the moment it lands"
          body="One notification a week, with your standing in the title. Nothing else."
          thumbId={HERO.id}
        />
      </div>
    </div>
  </PhoneFrame>
);

export const WhereToAsk: Story = {
  name: 'Where to ask',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="Ask once, right after the good part">
        <p>
          A browser only lets us ask for permission a handful of times before
          it stops asking on our behalf, so the moment matters more than the
          copy. The research on priming is consistent: ask after value was
          delivered, say exactly what will be sent and how often, and never
          trigger the native prompt cold. daily.dev already has this pattern as
          EnableNotification with a source per surface; Replay is one more
          source, and the deck gives it the best moment in the product.
        </p>
      </PageHeader>

      <Section
        title="A · After the last card"
        description="The deck was just viewed to the end. The person is at peak positive affect and has the whole week's evidence in front of them. One card, one ask, then the handoff."
      >
        <div className="flex flex-wrap items-start gap-8">
          <AfterTheDeck />
          <div className="flex max-w-[26rem] flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="Why this is the one">
              <p>
                Every other surface asks before the person knows what a Replay
                is. This one asks after they liked one. It also only fires for
                people who finished the deck, which is the audience most likely
                to open the next one.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Neutral} title="Cadence">
              <p>
                Once, on the first finished Replay. If dismissed, not again for
                four weeks, then once more. Two dismissals and it never asks
                again; the settings row is always there.
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      <Section
        title="B · Inside the handoff"
        description="No extra card: the handoff already says 'next Replay lands Monday', so the ask sits under it as a row. Lower friction, lower attention."
      >
        <div className="flex flex-wrap items-end gap-8">
          <FrameThumb width={220} candidate={handoffFrame} data={sampleData.handoff} />
          <SoftPrompt tone={PromptTone.Row} headline="Notify me when it lands" body="Mondays, one a week" primary="Turn on" />
        </div>
      </Section>

      <Section
        title="C · On the feed card, day three"
        description="For people who saw the card but never opened the deck: a quiet line under the strip. Weakest moment, widest reach."
      >
        <div className="flex flex-col gap-3">
          <SoftPrompt tone={PromptTone.Row} headline="Get Monday's Replay as a notification" body="You have not opened this week's yet. Next one is Monday." primary="Notify me" />
        </div>
      </Section>

      <Section
        title="D · In the notification center"
        description="The existing EnableNotification banner, with a Replay source. Right context, wrong audience: people in the notification center already look at notifications."
      >
        <NotificationCenter width={30}>
          <div className="p-3">
            <SoftPrompt tone={PromptTone.Banner} headline="Get your Replay on Mondays" body="Push it to this device when the week is in." primary="Enable" />
          </div>
          <NotificationRow title="Top 2% of Kubernetes readers this week." description="Your week 37 Replay. Four more cards inside." thumbId={HERO.id} time="2h" unread={false} />
        </NotificationCenter>
      </Section>

      <Section
        title="E · Settings"
        description="Always available, never discovered. A row under Your world, next to the briefing and the digest, on both the push and email tabs."
      >
        <div className="w-[30rem] max-w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4">
          <SettingsToggle label="Presidential briefing" description="Your daily brief, when it is ready" />
          <SettingsToggle label="Replay" description="Your week, every Monday. One notification.">
            <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
              Mondays at <span className="rounded-8 bg-surface-hover px-2 py-0.5 font-bold text-text-primary">8:00</span> local time
            </div>
          </SettingsToggle>
          <SettingsToggle label="Reading reminder" description="A nudge at your usual reading time" on={false} />
        </div>
      </Section>

      <Section title="Side by side">
        <Table
          head={['Moment', 'Who sees it', 'State of mind', 'Expected opt-in', 'Cost of a no']}
          minWidth={60}
          rows={[
            ['A · After the last card', 'Finished the deck', 'Just enjoyed it', 'Highest', 'Low: four weeks quiet'],
            ['B · Inside the handoff', 'Reached the end', 'Leaving', 'High', 'Low'],
            ['C · Feed card, day three', 'Saw it, never opened', 'Indifferent', 'Low', 'Burns one of the few asks'],
            ['D · Notification center', 'Already reading notifications', 'Task-focused', 'Medium', 'Low'],
            ['E · Settings', 'Looking for it', 'Deliberate', 'Near total, tiny reach', 'None'],
          ]}
        />
        <Callout tone={CalloutTone.Good} title="The pick">
          <p>
            <Mono>A</Mono> as the ask, <Mono>E</Mono> as the home, <Mono>B</Mono>{' '}
            as the fallback for people who dismissed A once. C and D burn asks on
            people who have not felt the value yet.
          </p>
        </Callout>
      </Section>
    </Page>
  ),
};

export const TheFlow: Story = {
  name: 'The two-step ask',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="Soft ask, then the browser, then a fallback">
        <p>
          The native prompt is a one-way door: a Block in Chrome is silent and
          permanent until the person digs into site settings. So the app asks
          first with its own card, only calls the browser after a yes, and has a
          plan for the no.
        </p>
      </PageHeader>

      <Section title="The sequence">
        <Timeline
          steps={[
            { when: 'Step 1', channel: 'Soft ask, in-product', what: 'Our card. Says what, how often, and shows the thing. A "not now" costs nothing.' },
            { when: 'Step 2', channel: 'Browser prompt', what: 'Only after a yes. Chrome, Safari or the iOS wrapper shows its own dialog.', hue: '#4A7EEE' },
            { when: 'Allowed', channel: 'Confirmation', what: 'A toast: "Mondays, 8am. Change any time in settings." Then nothing until Monday.', hue: '#57E087' },
            { when: 'Blocked', channel: 'Fallback', what: 'No shame, no retry. Offer the email instead, right there, one tap.', hue: '#F25D82' },
          ]}
        />
      </Section>

      <Section title="Rendered">
        <div className="flex flex-wrap items-start gap-8">
          <Variant label="1 · Soft ask">
            <SoftPrompt headline="Get next Monday's the moment it lands" body="One notification a week, with your standing in the title. Nothing else." thumbId={HERO.id} />
          </Variant>
          <Variant label="2 · Browser prompt" note="Chrome on desktop. Safari and the iOS wrapper look different and say the same thing.">
            <NativePermission />
          </Variant>
          <Variant label="3a · Allowed">
            <div className="flex flex-col gap-3">
              <NativePermission state={PermissionState.Granted} />
              <Toast title="Mondays at 8am. Change any time in settings." cta="OK" />
            </div>
          </Variant>
          <Variant label="3b · Blocked" note="The browser said no, so we do not ask it again. Email is the same sentence in a different inbox.">
            <div className="flex flex-col gap-3">
              <NativePermission state={PermissionState.Denied} />
              <SoftPrompt tone={PromptTone.Row} headline="Email it on Mondays instead?" body="Same Replay, same time, your inbox." primary="Email me" />
            </div>
          </Variant>
        </div>
      </Section>

      <Section title="Copy for the soft ask">
        <Table
          head={['Version', 'Headline', 'Body', 'Verdict']}
          minWidth={60}
          rows={[
            ['Specific', 'Get next Monday\'s the moment it lands', 'One notification a week, with your standing in the title. Nothing else.', 'Ship. Says the cadence, the content and the limit.'],
            ['Loss-framed', 'Do not miss next week\'s', 'Your Replay expires every Sunday.', 'No. Replay does not expire, and fear is the wrong note after a good deck.'],
            ['Generic', 'Turn on notifications', 'Stay up to date with daily.dev.', 'No. Sounds like every other site; this is exactly the ask people have learned to block.'],
            ['Social', '6% of developers read like you. Meet next week\'s', 'A notification when Monday\'s Replay is in.', 'Test. Uses the claim, but the promise is vaguer than the specific version.'],
          ]}
        />
      </Section>

      <Section title="Per platform">
        <div className="grid gap-4 tablet:grid-cols-3">
          <Cell label="Web app" note="Web push">
            <p className="text-text-tertiary typo-footnote">
              The existing PushNotificationContext and EnableNotification.
              Adding a <Mono>NotificationPromptSource.Replay</Mono> gives the ask
              its own analytics and its own dismissal memory.
            </p>
          </Cell>
          <Cell label="Extension" note="No web push">
            <p className="text-text-tertiary typo-footnote">
              The new tab page cannot receive push. The ask points at the web
              app or at email, never at a permission the extension cannot hold.
            </p>
          </Cell>
          <Cell label="iOS and Android wrappers" note="Native prompt">
            <p className="text-text-tertiary typo-footnote">
              The wrapper shows the OS dialog, which is a true one-shot. The soft
              ask is not optional there; it is the only thing standing between
              us and a permanent no.
            </p>
          </Cell>
        </div>
      </Section>

      <Section title="What already exists">
        <Table
          head={['Piece', 'Where', 'Replay needs']}
          minWidth={56}
          rows={[
            ['Soft ask component with per-source dismissal memory', <Mono>components/notifications/EnableNotification.tsx</Mono>, 'A Replay source and the post-deck placement'],
            ['Permission plumbing per platform', <Mono>contexts/PushNotificationContext.tsx</Mono>, 'Nothing'],
            ['Per-type in-app, push and email switches', <Mono>notifications/InAppNotificationsTab, EmailNotificationsTab</Mono>, 'One ReplayReady type under Your world'],
            ['Scheduled personal sends with a preferred hour', <Mono>UserPersonalizedDigestType</Mono>, 'A Replay type, weekly, Monday'],
          ]}
        />
      </Section>
    </Page>
  ),
};

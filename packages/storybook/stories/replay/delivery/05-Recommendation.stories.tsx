import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { linkTo } from '@storybook/addon-links';
import {
  Callout,
  CalloutTone,
  Cell,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from '../shell';
import { HERO, HERO_CLAIM, NotificationRow, SystemPush, Timeline, Toast } from './mocks';
import { EmailButton, EmailCardImage, EmailFrame, EmailHeading, EmailText } from './mocks';

const meta: Meta = {
  title: 'Replay delivery/05. The recommendation',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Channel by moment, the Monday timeline, what already exists in the codebase, and the questions left to decide.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Recommendation: Story = {
  name: 'Channels, moments, and the pick',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="One sentence, four channels, in this order">
        <p>
          The feed card is the product; everything else is a way of getting
          someone to it. The stack below layers the channels by how much they
          cost the person, starts every one of them from the same hero claim,
          and uses the deck itself to earn the right to the louder channels.
        </p>
      </PageHeader>

      <Section title="The stack">
        <Table
          head={['Layer', 'Channel', 'Who', 'When', 'Ships']}
          minWidth={64}
          rows={[
            ['1', 'Feed hero slot, decaying to card, strip, bell', 'Everyone eligible', 'First session of the week, then every day', 'First'],
            ['2', 'In-app notification row', 'Everyone eligible', 'Monday at the send hour', 'First, same PR'],
            ['3', 'Email, hero only', 'Eligible, with Replay emails on (default on if any email is on)', 'Monday at the digest hour, cancelled if opened first', 'Second'],
            ['4', 'Push', 'Eligible, with push on', 'Same time as the email, same cancellation', 'Second'],
            ['5', 'The post-deck ask for push', 'Finished a deck, no push yet', 'Once, then four weeks quiet, then once more', 'Second'],
            ['6', 'The Monday sheet on mobile', 'First Replay ever', 'First session', 'Test'],
          ]}
        />
      </Section>

      <Section title="Monday, for Maya">
        <Timeline
          steps={[
            { when: '08:00', channel: 'Email + push', what: HERO_CLAIM, hue: '#4A7EEE' },
            { when: '09:14', channel: 'Feed, hero slot', what: 'Same claim, the card as proof. She opens it.' },
            { when: '09:15', channel: 'The deck', what: 'Five cards. She copies the archetype card and posts it.', hue: '#F25D82' },
            { when: '09:16', channel: 'After the last card', what: 'The push ask, because push was off. She says yes.', hue: '#57E087' },
            { when: '09:16', channel: 'Handoff', what: '"That was week 37. Next Replay lands Monday."', hue: '#887BF8' },
            { when: 'Tue to Sun', channel: 'Seen row', what: 'One row in the feed, one read row in the bell. Nothing else.', hue: '#A9F261' },
          ]}
        />
        <div className="flex flex-wrap items-start gap-6">
          <SystemPush title={HERO_CLAIM} body="Your week 37 Replay. Four more cards inside." thumbId={HERO.id} time="08:00" />
          <Toast title={HERO_CLAIM} />
          <div className="w-[26rem] max-w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary">
            <NotificationRow title={HERO_CLAIM} description="Your week 37 Replay. Four more cards inside." thumbId={HERO.id} time="08:00" />
          </div>
        </div>
        <EmailFrame subject={HERO_CLAIM} preheader="Your week 37 Replay. Four more cards inside, forty seconds." compact>
          <EmailHeading>{HERO_CLAIM}</EmailHeading>
          <EmailText muted>Out of 12,400 developers who read Kubernetes this week.</EmailText>
          <EmailCardImage id={HERO.id} width={240} />
          <EmailButton>Open your Replay</EmailButton>
        </EmailFrame>
      </Section>

      <Section title="Monday, for Tom" description="Three opens, no push, no email on. Layer 1 and 2 only.">
        <Timeline
          steps={[
            { when: 'Mon', channel: 'Nothing arrives', what: 'No email on, no push on. The week waits for him.', hue: '#887BF8' },
            { when: 'Wed 19:40', channel: 'Feed, native card', what: 'Day three of the decay. "More obscure sources than 91% of developers."' },
            { when: 'Wed 19:41', channel: 'Reduced deck', what: 'Three cards and the handoff. He finishes.', hue: '#F25D82' },
            { when: 'Wed 19:42', channel: 'After the last card', what: 'The push ask. He taps not now; quiet for four weeks.', hue: '#57E087' },
            { when: 'Thu to Sun', channel: 'Seen row', what: 'One row.', hue: '#A9F261' },
          ]}
        />
      </Section>

      <Section title="What the codebase already has">
        <Table
          head={['Need', 'Exists as', 'Gap']}
          minWidth={60}
          rows={[
            ['A typed in-app notification with push and email switches', <Mono>NotificationType.BriefingReady / DigestReady</Mono>, 'Add ReplayReady under Your world'],
            ['A scheduled personal send with a preferred hour and day', <Mono>UserPersonalizedDigestType.Brief</Mono>, 'Add Replay, weekly on Monday, reusing the digest hour'],
            ['A soft ask with per-source dismissal memory and analytics', <Mono>EnableNotification + NotificationPromptSource</Mono>, 'Add a Replay source and the post-deck placement'],
            ['A feed slot at a fixed position', <Mono>FeedItemType.Highlight at index 3</Mono>, 'A Replay item type with the day-by-day decay'],
            ['A per-user share link', <Mono>r.daily.dev/u/…</Mono>, 'Attach it to the email button and the deep link'],
            ['A server that renders card images', 'None', 'The share PNG renderer, which the email also needs'],
          ]}
        />
      </Section>

      <Section title="Left to decide">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="1 · Is the Replay email on by default?">
            <p className="text-text-tertiary typo-footnote">
              My pick: on for anyone who already receives a daily.dev email, off
              otherwise. It is the largest single lever on Monday opens, and a
              one-line weekly email with an obvious switch is inside what people
              already accepted.
            </p>
          </Cell>
          <Cell label="2 · Hero slot or Monday sheet on mobile?">
            <p className="text-text-tertiary typo-footnote">
              My pick: hero slot for everyone, sheet only for the first Replay a
              person ever gets, as a test. Interruptions convert once and train
              a reflex after that.
            </p>
          </Cell>
          <Cell label="3 · Does the claim go on the lock screen?">
            <p className="text-text-tertiary typo-footnote">
              My pick: yes. &quot;Top 2% of Kubernetes readers&quot; is nothing to
              hide, and it is the whole reason the push gets tapped. If a hero
              card ever carried something private, the engine would not have
              picked it as the hero.
            </p>
          </Cell>
          <Cell label="4 · How hard do we push for push?">
            <p className="text-text-tertiary typo-footnote">
              My pick: one ask after the first finished deck, one more four
              weeks later, then never. The settings row is the home. Every
              wasted ask makes the browser stop asking for us.
            </p>
          </Cell>
        </div>
        <Callout tone={CalloutTone.Good} title="If only one thing ships">
          <p>
            The feed hero slot with the day-by-day decay, and the in-app row
            beside it. Both quote the hero card, both need no new permission,
            and together they reach everyone who was going to open a Replay
            this week anyway. Email and push are how the same sentence reaches
            the people who were not.
          </p>
        </Callout>
        <div className="flex flex-wrap gap-3">
          {[
            ['Replay delivery/01. In the feed', 'Seven entry points', 'The feed entry points'],
            ['Replay delivery/02. Notification', 'In the notification center', 'The notification'],
            ['Replay delivery/03. Turning notifications on', 'Where to ask', 'The push ask'],
            ['Replay delivery/04. Email', 'Four shapes', 'The email'],
          ].map(([kind, story, label]) => (
            <button
              key={kind}
              type="button"
              onClick={linkTo(kind, story)}
              className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
            >
              {label} →
            </button>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

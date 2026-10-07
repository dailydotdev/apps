import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
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
import { CAST } from '../people';
import {
  BellButton,
  HERO,
  HERO_CLAIM,
  LockScreen,
  NotificationCenter,
  NotificationRow,
  PushPlatform,
  RowKind,
  SystemPush,
  Toast,
  Variant,
} from './mocks';

const meta: Meta = {
  title: 'Replay delivery/02. Notification',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The in-app notification, the push it becomes when notifications are on, and the copy that decides whether either gets tapped.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const COPY: {
  name: string;
  title: string;
  body: string;
  tag?: 'recommended' | 'fallback' | 'rejected';
  why: string;
}[] = [
  {
    name: 'The claim',
    title: HERO_CLAIM,
    body: 'Your week 37 Replay. Four more cards inside.',
    tag: 'recommended',
    why: 'The notification is the first card. Standing was the most shared stat in every precedent we found, so it goes in the sentence people see on the lock screen.',
  },
  {
    name: 'The label',
    title: 'You were a Night Owl Infra Digger this week.',
    body: '6% of developers read like you. Your Replay is in.',
    tag: 'recommended',
    why: 'When the hero is an identity card rather than a standing, the label leads. Nouns get repeated; "your recap is ready" does not.',
  },
  {
    name: 'The gap',
    title: '6% of developers read the way you do.',
    body: 'Find out which 6%. Week 37 Replay.',
    tag: 'fallback',
    why: 'A curiosity gap converts, but it spends the claim before the card can. Use it only when the hero card would otherwise leak its whole payload in one line.',
  },
  {
    name: 'The generic',
    title: 'Your week 37 Replay is ready.',
    body: '5 cards about your week on daily.dev.',
    tag: 'rejected',
    why: 'Says nothing about the person. This is what every other product sends, and it is why their open rates fall by week four.',
  },
];

export const InApp: Story = {
  name: 'In the notification center',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="One row, once a week, and it says the claim">
        <p>
          daily.dev already has a notification center with a type per event
          (BriefingReady, DigestReady, UserTopReaderBadge). Replay is one more
          type, ReplayReady, delivered in-app for everyone, and as push and email
          for people who turned those on. The row is the same everywhere; what
          differs is the sentence.
        </p>
      </PageHeader>

      <Section
        title="Four ways to say it"
        description="Same row, four sentences. The recommended two quote the hero card. The row carries the hero card as its attachment, which is what a notification of a Replay should look like: a thumbnail of the thing."
      >
        <div className="flex flex-wrap items-start gap-6">
          {COPY.map((copy) => (
            <Variant key={copy.name} label={copy.name} tag={copy.tag} note={copy.why} width="26rem">
              <NotificationCenter>
                <NotificationRow title={copy.title} description={copy.body} thumbId={HERO.id} time="now" />
                <NotificationRow
                  kind={RowKind.Comment}
                  unread={false}
                  person={CAST[1]}
                  title={
                    <>
                      <b>Kelsey H.</b> replied to your comment on <b>kubectl apply</b>
                    </>
                  }
                  time="3h"
                />
              </NotificationCenter>
            </Variant>
          ))}
        </div>
      </Section>

      <Section
        title="The bell"
        description="The dot is the same dot as any other unread. Replay does not get its own badge colour or its own icon in the header; the row is where it is different."
      >
        <div className="flex flex-wrap items-center gap-8">
          <Variant label="Unread, Monday">
            <BellButton count={1} />
          </Variant>
          <Variant label="Stacked with the week's other notifications">
            <BellButton count={4} />
          </Variant>
          <Variant label="Opened">
            <BellButton active />
          </Variant>
        </div>
      </Section>

      <Section
        title="The row across the week"
        description="One row per week, replaced on Monday, never stacked. Opening the Replay from anywhere marks it read."
      >
        <NotificationCenter width={30}>
          <NotificationRow title={HERO_CLAIM} description="Your week 37 Replay. Four more cards inside." thumbId={HERO.id} time="now" />
          <NotificationRow
            unread={false}
            title="You were early to two of last week's three biggest stories."
            description="Week 36 Replay."
            time="7d"
          />
          <NotificationRow
            kind={RowKind.Streak}
            unread={false}
            title={
              <>
                <b>37 days.</b> Your streak is the longest it has ever been.
              </>
            }
            time="2d"
          />
        </NotificationCenter>
      </Section>

      <Section title="The session toast">
        <div className="flex flex-wrap items-start gap-6">
          <Variant
            label="First session on Monday, when no feed card is showing"
            note="For surfaces without a feed: the post page, search, a squad. Four seconds, one tap, gone."
          >
            <Toast title={HERO_CLAIM} />
          </Variant>
          <Callout tone={CalloutTone.Neutral} title="Not on top of the feed card">
            <p>
              The toast exists for the sessions that start somewhere other than
              the feed. If the hero slot is on screen the toast never fires, or
              the same claim is on the page twice.
            </p>
          </Callout>
        </div>
      </Section>

      <Section title="Rules">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="Copy comes from the hero card">
            <p className="text-text-tertiary typo-footnote">
              The selection engine already picks the Tier S card for slot one.
              Its headline is the notification title, its standing scope is the
              body. No separate copy to write, no way for the two to disagree.
            </p>
          </Cell>
          <Cell label="One type, three channels">
            <p className="text-text-tertiary typo-footnote">
              <Mono>NotificationType.ReplayReady</Mono>, in the &quot;Your
              world&quot; category next to the briefing and the digest, so it
              inherits the existing in-app, push and email switches instead of
              adding a fourth.
            </p>
          </Cell>
          <Cell label="Deep link into the deck">
            <p className="text-text-tertiary typo-footnote">
              The row opens the Replay directly, card one, not the feed. If the
              person left half way, it opens where they stopped.
            </p>
          </Cell>
          <Cell label="Skip when there is nothing to say">
            <p className="text-text-tertiary typo-footnote">
              Zero opens means no Replay, so no notification either. A row that
              opens onto nothing is worse than no row.
            </p>
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};

export const Push: Story = {
  name: 'As a push',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="The same sentence on a lock screen">
        <p>
          Push is the in-app row leaving the app. It only reaches people who
          turned notifications on (03), and it is judged in the worst light:
          against a wallpaper, between a calendar alert and a group chat. The
          claim has to read at a glance, and the thumbnail has to survive at 38
          pixels.
        </p>
      </PageHeader>

      <Section title="macOS, Monday 8:02">
        <div className="flex flex-wrap items-start gap-6">
          <Variant label="The claim" tag="recommended">
            <SystemPush title={HERO_CLAIM} body="Your week 37 Replay. Four more cards inside." thumbId={HERO.id} />
          </Variant>
          <Variant label="The label">
            <SystemPush title="You were a Night Owl Infra Digger." body="6% of developers read like you. Week 37 Replay." thumbId="persona.week" />
          </Variant>
          <Variant label="The generic" tag="rejected">
            <SystemPush title="Your week 37 Replay is ready" body="5 cards about your week on daily.dev." />
          </Variant>
        </div>
      </Section>

      <Section title="iPhone lock screen">
        <div className="flex flex-wrap items-start gap-6">
          <LockScreen>
            <SystemPush platform={PushPlatform.Ios} title={HERO_CLAIM} body="Your week 37 Replay. Four more cards inside." thumbId={HERO.id} time="now" />
            <SystemPush platform={PushPlatform.Ios} title="Standup moved to 10:30" body="Calendar" time="12m" />
          </LockScreen>
          <div className="flex max-w-[26rem] flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="Why the claim wins here">
              <p>
                On a lock screen the title is all that is read. &quot;Top 2% of
                Kubernetes readers&quot; is a complete thought; &quot;Your Replay
                is ready&quot; is an errand.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Neutral} title="Send time">
              <p>
                Monday at the person&apos;s digest hour, local time, and never
                before 7am. Someone with no digest hour gets 8am. One push per
                week; a Replay that was opened in-app before the send time
                cancels the push.
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      <Section title="Subject and body, by hero card">
        <Table
          head={['Hero card', 'Title', 'Body']}
          minWidth={60}
          rows={[
            [<Mono>rank.topicReader</Mono>, 'Top 2% of Kubernetes readers this week.', 'Your week 37 Replay. Four more cards inside.'],
            [<Mono>persona.week</Mono>, 'You were a Night Owl Infra Digger.', '6% of developers read like you. Week 37 Replay.'],
            [<Mono>source.obscurity</Mono>, 'More obscure sources than 91% of developers.', 'Your week 37 Replay. Four more cards inside.'],
            [<Mono>achievement.unlocked</Mono>, 'Deep Diver unlocked. 0.9% of developers have it.', 'Emerald tier. Your week 37 Replay is in.'],
            [<Mono>crown.topReader</Mono>, 'Top reader in Kubernetes this week.', 'Out of 12,400. Your week 37 Replay is in.'],
            [<Mono>creator.reach</Mono>, '18,420 developers read your post.', 'Top 3% of posts this week. Your Replay is in.'],
          ]}
        />
      </Section>
    </Page>
  ),
};

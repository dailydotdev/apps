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
import {
  EmailButton,
  EmailCardImage,
  EmailFrame,
  EmailHeading,
  EmailText,
  HERO,
  HERO_CLAIM,
  SettingsToggle,
  Variant,
} from './mocks';

const meta: Meta = {
  title: 'Replay delivery/04. Email',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Monday email: four shapes, the subject lines, and the rules that keep it a notification rather than a second product.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const DECK = ['rank.topicReader', 'persona.week', 'source.obscurity', 'reading.grid', 'posts.top'];

export const Variants: Story = {
  name: 'Four shapes',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="The email is the notification, not the Replay">
        <p>
          Email reaches everyone the app does not: the person who did not open
          daily.dev on Monday, the person who never turned push on, the person
          reading on a phone with no app. Its job is one tap into the deck. The
          moment it tries to be the deck, it loses the share buttons, the
          animation, the swipe, and the reason to come back.
        </p>
      </PageHeader>

      <Section
        title="A · The hero card, and a door"
        description="One image, one sentence, one button. The card is a pre-rendered 4:5 image, which is what email clients and X both want. Everything else lives in the app."
      >
        <div className="flex flex-wrap items-start gap-8">
          <Variant label="Hero only" tag="recommended" width="40rem">
            <EmailFrame subject={HERO_CLAIM} preheader="Your week 37 Replay. Four more cards inside, forty seconds.">
              <EmailHeading>{HERO_CLAIM}</EmailHeading>
              <EmailText muted>
                Out of 12,400 developers who read Kubernetes this week. Four more cards about your week are waiting.
              </EmailText>
              <EmailCardImage id={HERO.id} width={320} caption="Card 1 of 5 · tap to open your Replay" />
              <EmailButton>Open your Replay</EmailButton>
            </EmailFrame>
          </Variant>
          <div className="flex max-w-[24rem] flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="Why hero only">
              <p>
                It is the same claim as the push and the feed card, so the week
                has one sentence wherever it is met. It keeps the other four cards
                as the reason to tap. And it is short enough that Gmail does not
                clip it.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Neutral} title="Image or live HTML">
              <p>
                Image. The frames are built for a renderer we control; email
                clients would break the gradients, the fonts and the container
                units. The server that exports the share PNG exports this one
                too, at 4:5, and the alt text is the claim.
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      <Section
        title="B · The whole deck"
        description="All five cards stacked. Complete, long, and it gives away the reason to open the app. Good as an annual email; wrong for a weekly one."
      >
        <Variant label="Full deck" tag="rejected" width="40rem">
          <EmailFrame subject={HERO_CLAIM} preheader="Your week 37 in five cards." compact>
            <EmailHeading>Your week 37, in five cards</EmailHeading>
            <div className="grid grid-cols-2 gap-4">
              {DECK.map((id) => (
                <EmailCardImage key={id} id={id} width={272} />
              ))}
            </div>
            <EmailButton>Share a card</EmailButton>
          </EmailFrame>
        </Variant>
      </Section>

      <Section
        title="C · Plain text"
        description="No image at all. Deliverability at its best, the design language gone. The fallback for clients that block images, and the multipart text alternative for A."
      >
        <Variant label="Text first" tag="fallback" width="40rem">
          <EmailFrame subject={HERO_CLAIM} preheader="Your week 37 Replay is in." compact>
            <EmailText>Hi Maya,</EmailText>
            <EmailText>
              You were in the top 2% of Kubernetes readers this week, out of 12,400 developers who read the topic. That is card one of five in your week 37 Replay.
            </EmailText>
            <EmailText>The other four: your archetype, your sources, your week as a grid, and what your post did.</EmailText>
            <EmailButton>Open your Replay</EmailButton>
            <EmailText muted>Forty seconds. Every card can be posted from the app.</EmailText>
          </EmailFrame>
        </Variant>
      </Section>

      <Section
        title="D · A block inside Monday's digest"
        description="No new email. The people who already get the digest get a Replay block at the top of Monday's issue. One fewer send, one fewer unsubscribe surface, and the smallest reach: only digest subscribers, only on their digest day."
      >
        <Variant label="Digest block" tag="fallback" width="40rem">
          <EmailFrame subject="Your Monday digest, and your top 2%" preheader="Top 2% of Kubernetes readers this week. Plus five posts picked for you." compact>
              <div className="flex items-center gap-4 rounded-16 p-4" style={{ background: '#0F0F12' }}>
                <EmailCardImage id={HERO.id} width={120} />
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,.55)' }}>Your Replay · week 37</span>
                  <span className="text-[18px] font-bold leading-tight text-white">{HERO_CLAIM}</span>
                  <span className="w-fit rounded-10 bg-white px-3 py-1.5 text-[13px] font-bold" style={{ color: '#0F0F12' }}>Open</span>
                </div>
              </div>
              <EmailHeading>Five posts picked for you</EmailHeading>
              {['Postgres 19 ships async I/O, and the numbers are absurd', 'What actually happens when you run kubectl apply', 'Rust in the kernel, one year on'].map((title) => (
                <div key={title} className="flex flex-col gap-0.5 border-b pb-3" style={{ borderColor: '#E8E9EE' }}>
                  <span className="text-[15px] font-semibold">{title}</span>
                  <span className="text-[12px]" style={{ color: '#6B6F7B' }}>6 min read</span>
                </div>
              ))}
          </EmailFrame>
        </Variant>
      </Section>

      <Section title="Side by side">
        <Table
          head={['Shape', 'Reach', 'Reason to tap', 'Length', 'Verdict']}
          minWidth={60}
          rows={[
            ['A · Hero only', 'Everyone eligible with email on', 'Four cards they have not seen', 'Short, no clipping', 'Ship'],
            ['B · Whole deck', 'Same', 'None left', 'Long, clipped in Gmail', 'Annual only'],
            ['C · Plain text', 'Same, plus image-blocking clients', 'Four cards', 'Short', 'The text alternative of A'],
            ['D · Digest block', 'Digest subscribers, on their digest day', 'Four cards', 'Adds to an existing email', 'Keep as the no-new-email option'],
          ]}
        />
      </Section>
    </Page>
  ),
};

export const Subjects: Story = {
  name: 'Subject lines and rules',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="The subject line is the card, again">
        <p>
          Inbox rules are notification rules: the first forty characters carry
          it, the claim beats the announcement, and the same string should
          arrive every week in the same shape so the eye finds it.
        </p>
      </PageHeader>

      <Section title="Subject and preheader, by hero card">
        <Table
          head={['Hero card', 'Subject', 'Preheader']}
          minWidth={64}
          rows={[
            [<Mono>rank.topicReader</Mono>, 'Top 2% of Kubernetes readers this week', 'Your week 37 Replay. Four more cards inside, forty seconds.'],
            [<Mono>persona.week</Mono>, 'You were a Night Owl Infra Digger this week', '6% of developers read like you. Week 37 Replay.'],
            [<Mono>source.obscurity</Mono>, 'More obscure sources than 91% of developers', 'Your week 37 Replay is in.'],
            [<Mono>achievement.unlocked</Mono>, 'Deep Diver unlocked. 0.9% of developers have it', 'Emerald tier. Your week 37 Replay.'],
            [<Mono>creator.companies</Mono>, 'Developers at Google, Vercel and Shopify read your post', 'And 400 more companies. Week 37 Replay.'],
            [<Mono>xp.earned</Mono>, 'Top 9% of XP earners this week', 'Your week 37 Replay. Four more cards inside.'],
          ]}
        />
        <Table
          head={['Rejected subject', 'Why']}
          minWidth={48}
          rows={[
            ['Your week 37 Replay is ready', 'Says nothing about them. The digest already owns the "is ready" slot on Monday.'],
            ['You will not believe your reading stats', 'Clickbait shape. Sincerity comes from a flat, issued tone.'],
            ['🔥 Maya, your Replay is here!', 'Emoji, first name, exclamation: the three signals of a marketing send, in one line.'],
            ['Weekly recap: 47 posts, 3.1 hours, 6 topics', 'A receipt. Numbers with no comparison are the cards we cut.'],
          ]}
        />
      </Section>

      <Section title="Rules">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="Who gets it">
            <p className="text-text-tertiary typo-footnote">
              Anyone eligible for a Replay that week (one or more opens) with
              Replay emails on. Default on for people who already receive any
              daily.dev email, off for people who receive none, with the switch
              under Your world on the email tab.
            </p>
          </Cell>
          <Cell label="When">
            <p className="text-text-tertiary typo-footnote">
              Monday at the person&apos;s digest hour, local time, 8am for people
              without one. If the Replay was opened in the app before then, the
              email does not send; the push does not either.
            </p>
          </Cell>
          <Cell label="One send, one link">
            <p className="text-text-tertiary typo-footnote">
              One email per week, one button, and the button deep-links to card
              one with the person&apos;s share code attached, so a post from the
              app after an email open is still attributed.
            </p>
          </Cell>
          <Cell label="Nothing to say, nothing sent">
            <p className="text-text-tertiary typo-footnote">
              Zero opens means no Replay, so no email. The absence is the
              message; a &quot;quiet week&quot; email would be the nudge this
              initiative is not.
            </p>
          </Cell>
        </div>
      </Section>

      <Section title="The switch">
        <div className="w-[30rem] max-w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4">
          <SettingsToggle label="Personalized digest" description="Daily · 8:00" />
          <SettingsToggle label="Replay" description="Your week, every Monday. One email with your best card." />
          <SettingsToggle label="Presidential briefing" description="When it is ready" on={false} />
        </div>
      </Section>
    </Page>
  ),
};

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Direction } from './firstRead';
import { directionLabels, FirstFeed } from './firstRead';
import { Checklist, Labeled, Page, Section } from './kit';
import Providers from '../extension/_providers';

interface Args {
  alreadyRead: boolean;
}

const meta: Meta<Args> = {
  title: 'Onboarding Fixes/3. Start reading',
  parameters: { layout: 'fullscreen' },
  args: { alreadyRead: false },
  argTypes: {
    alreadyRead: {
      control: 'boolean',
      name: 'After the first read',
    },
  },
};

export default meta;

type Story = StoryObj<Args>;

const direction = (id: Direction): Story => ({
  name: directionLabels[id],
  render: ({ alreadyRead }) => (
    <Providers>
      <div className="min-h-screen bg-background-default">
        <FirstFeed
          key={String(alreadyRead)}
          direction={id}
          alreadyRead={alreadyRead}
        />
      </div>
    </Providers>
  ),
});

export const Overview: Story = {
  name: 'Read me',
  parameters: { controls: { disable: true } },
  render: () => (
    <Page
      eyebrow="Action item · Guide user to first recommended action: start reading"
      title="Point a new user at their first read"
      intro={
        <>
          After the last onboarding step the app replaces the route with the
          feed and says nothing. The only thing asking for attention is the
          intro quest button, which shakes every five seconds. Nothing says the
          next move is to open a post, even though a read is what trains the
          feed and what the first quest counts.
        </>
      }
    >
      <Section
        title="Three directions"
        note="All three use the real feed card. Click a card (or the button) to see the after-first-read state."
      >
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
          <Labeled label="A · Recommended" tone="after">
            <p className="text-text-secondary typo-callout">
              <strong className="text-text-primary">
                Start here on the top card.
              </strong>{' '}
              A purple ring and a “Start here” tag on the first post. No new
              surface, nothing to read before reading. Gone after the first
              read.
            </p>
          </Labeled>
          <Labeled label="B">
            <p className="text-text-secondary typo-callout">
              <strong className="text-text-primary">Welcome strip.</strong> One
              line on why reading matters and a “Read the top pick” button.
              Clearest explanation, but it pushes the feed down a row.
            </p>
          </Labeled>
          <Labeled label="C">
            <p className="text-text-secondary typo-callout">
              <strong className="text-text-primary">Three picks card.</strong> A
              feed-sized card in the first slot listing three titles. Feels
              native, but it is one more list to parse before the first read.
            </p>
          </Labeled>
        </div>
      </Section>
      <Section title="Shared rules">
        <Checklist
          items={[
            {
              done: true,
              text: 'One cue, shown to users who finished onboarding and have not read a post yet. It leaves for good on the first read.',
            },
            {
              done: true,
              text: 'The first read gets a short toast: “Your feed learns from every post you open.” It answers why, at the moment it matters.',
            },
            {
              done: false,
              text: 'To decide when shipping: hold the intro quest button’s shake while the cue is up, so two things don’t compete for the first click.',
            },
            {
              done: false,
              text: 'To decide when shipping: the trigger. Today there is no read ActionType on the client; the read_post quest progress or post.read on the first card could drive it.',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};

export const Today = direction('today');
export const A = direction('a');
export const B = direction('b');
export const C = direction('c');

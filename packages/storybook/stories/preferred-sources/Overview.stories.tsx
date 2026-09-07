import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bullets,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
  SpecTable,
} from '../open-graph/ogStoryLayout';

const TOC: Array<{ n: string; name: string; what: string }> = [
  {
    n: '1',
    name: 'How It Actually Works',
    what: 'The two integration routes, the exact code, eligibility, and the four gotchas that decide our build.',
  },
  {
    n: 'R',
    name: 'Review → 0. Final list',
    what: 'The five approved designs as the real product components, today vs proposed, at desktop / tablet / mobile.',
  },
  {
    n: '5',
    name: 'Measurement & Risks',
    what: 'What Google will and will not tell us, and the three ways this goes wrong.',
  },
];

const Overview = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Google Preferred Sources · Proposal"
      title="Make daily.dev a preferred source on Google — in the right slots, with the right ask"
    >
      On 20 August 2026 Google shipped an embeddable button that lets a reader
      mark a site as a “preferred source”, after which Google surfaces it more
      often in Top Stories, AI Overviews and AI Mode. We want that button for
      daily.dev. This deck is where it should live, what it should say, and the
      handful of technical facts that stop the copy-paste snippet from working
      in our app.
    </PageHeader>

    <Heading badge="start here">Three things that decide the design</Heading>

    <Bullets
      title="1 · The button adds the domain that hosts it"
      items={[
        'addPreferredSource() takes no arguments — it reads the origin. On daily.dev it always adds daily.dev, which is exactly what we want, but it also means the button is meaningful on any page we serve, not just post pages.',
        'That frees us up: the post page is one slot among many, and it is not even the highest-reach one.',
      ]}
    />
    <Bullets
      title="2 · Two audiences want opposite things"
      items={[
        'A loyal daily.dev user does not need Google to find dev content — they replaced that with us. For them this is a favour: “Make us preferred on Google”.',
        'A visitor who landed on a post page from a Google search does use Google for this, and more daily.dev in their results is a real benefit: “See more daily.dev in Google”.',
        'One label for both is the easiest mistake available here.',
      ]}
    />
    <Bullets
      title="3 · There is no read API"
      items={[
        'Google exposes init() and addPreferredSource() and nothing else, and Search Console has no preferred-source dimension. We can never ask whether someone already added us.',
        'So every slot will keep asking a user who said yes months ago unless we build the capping ourselves, globally, from day one.',
      ]}
    />

    <Divider />

    <Heading>Where it goes — the final five</Heading>
    <Muted>
      Chosen on one rule: it appears because of something the reader did, or in
      a container that already exists, and it never stays forever. Full renders
      are in Review → 0. Final list.
    </Muted>
    <SpecTable
      columns={['#', 'Design', 'Appears', 'Label']}
      rows={[
        [
          '1',
          'Post page · after an upvote',
          'Once, right after the reader upvotes, under the action bar',
          'Add as preferred source',
        ],
        [
          '2',
          'Post page · under the source card',
          'Every post, until clicked or dismissed',
          'Make us preferred on Google / Add as preferred source',
        ],
        [
          '3',
          'Quest · one-time milestone',
          'Once in the quest list; completes on click',
          'Make daily.dev a preferred source on Google',
        ],
        [
          '4',
          'Notification · sent once',
          'One system notification per user',
          'Google now lets you pick your sources',
        ],
        [
          '5',
          'Settings · permanent row',
          'Always — where it can be found again',
          'Add',
        ],
      ]}
    />

    <Divider />

    <Heading>What I would do, in order</Heading>
    <Bullets
      tone="good"
      items={[
        '1. Confirm daily.dev resolves in Google’s source preferences tool. A two-minute check that everything else depends on.',
        '2. Ship the email deeplink and the blog/changelog snippet — no app risk, no flag, and the email is the biggest single reach we have.',
        '3. Ship the post page strip for logged-out Google-referred visitors, plus the settings row and the footer link.',
        '4. Test the new tab strip and the logged-in sidebar widget behind a flag, with global capping in place from the start.',
        '5. Read our own click data by slot, then decide on the streak moment and the feed card.',
      ]}
    />
    <Muted>
      There is also a play here that is not a UI change at all: Google has
      publicly validated the premise daily.dev was built on — that readers
      should pick their own sources instead of having an algorithm pick for
      them. Google shipped a preferences panel buried in search settings; we
      shipped the whole product. That comparison writes itself, and it is the
      cheapest and highest-ceiling thing on this page.
    </Muted>

    <Divider />

    <Heading>The rest of this deck</Heading>
    <div style={{ display: 'grid', gap: 10, maxWidth: 900 }}>
      {TOC.map((item) => (
        <div
          key={item.n}
          style={{
            display: 'flex',
            gap: 16,
            padding: '14px 16px',
            borderRadius: 10,
            background: 'var(--theme-surface-float)',
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: '#CE3DF3',
              flexShrink: 0,
            }}
          >
            {item.n}
          </span>
          <span>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              {item.name}
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--theme-text-secondary)',
                textWrap: 'pretty',
              }}
            >
              {item.what}
            </div>
          </span>
        </div>
      ))}
    </div>
  </Page>
);

const meta: Meta<typeof Overview> = {
  title: 'Preferred Sources/0. Overview',
  component: Overview,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj<typeof Overview> = { name: 'Overview' };

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  ChapterNav,
  Goal,
  Page,
  PageHeader,
  Section,
  Source,
  Table,
  ChapterStatus,
  Status,
} from './kit';
import { benchmarks, evidence, guidance, principles } from './research';

const meta: Meta = {
  title: 'Mobile UX/2. Research',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const host = (url: string): string => new URL(url).hostname.replace('www.', '');

export const Research: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What do the platforms and the best apps do in 2026?"
        title="Apple and Google agree on more than they used to: five places at the bottom, one collapsing row at the top, minimize rather than hide, and no drawer."
      >
        <p>
          Desk research done on 28 Sep 2026: Apple HIG for iOS 26 (Liquid
          Glass), Material 3 and M3 Expressive, Android predictive back, the
          reachability literature, nine peer apps, and every published number
          on navigation changes I could verify. Sources are linked on each
          row; anything I could not confirm is not here.
        </p>
        <ChapterNav current="2" />
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="3">
        Platform and peer research. Extended in round 3 with the iOS 26 measurements and two-bar patterns that live in 3b.
      </Status>

      <Goal
        goal="Borrow what is proven, name what we deliberately will not copy, and end with principles we can point to in every later chapter."
        metric="Each recommendation in chapters 3 to 8 cites at least one row from this page."
      />

      <Section
        title="Platform guidance"
        description="The rules, and what each one implies for a WebView app that draws its own chrome."
      >
        <Table
          head={['Platform', 'Rule', 'Implication for us', 'Source']}
          rows={guidance.map((row) => [
            <span key={row.platform} className="font-bold text-text-primary">
              {row.platform}
            </span>,
            row.rule,
            row.implication,
            <Source key={row.source} href={row.source}>
              {host(row.source)}
            </Source>,
          ])}
        />
      </Section>

      <Section
        title="Peer apps"
        description="Content and community apps a daily.dev user also has on their phone. Tabs, the centre slot, the home header, how a post opens, the gesture worth noting."
      >
        <Table
          head={['App', 'Tabs', 'Centre', 'Home header', 'Post opens as', 'Gesture', 'Source']}
          rows={benchmarks.map((row) => [
            <span key={row.app} className="font-bold text-text-primary">
              {row.app}
            </span>,
            row.tabs,
            row.center,
            row.homeHeader,
            row.postOpens,
            row.gesture,
            <Source key={row.source} href={row.source}>
              {host(row.source)}
            </Source>,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="The consensus">
            Five tabs. Compose in the centre. Search and Profile in the bar.
            Feed switching as one pinned swipeable row under the top bar. A
            post is a full-page push. External links open in an in-app
            browser.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="What we do not copy">
            X&apos;s six icons and a product bet in the centre. Reddit&apos;s
            un-fixed header test. LinkedIn&apos;s everything-in-the-top-bar
            test (no results published). ChatGPT&apos;s no-bar drawer, which
            only works for a single-task app. Artifact&apos;s nine months of
            added surfaces.
          </Callout>
        </div>
      </Section>

      <Section
        title="Published evidence"
        description="What happened when someone changed navigation and told us the numbers. Self-reported figures are marked."
      >
        <Table
          head={['Who', 'What changed', 'Result', 'Source']}
          rows={evidence.map((row) => [
            <span key={row.who} className="font-bold text-text-primary">
              {row.who}
            </span>,
            row.what,
            row.result,
            <Source key={row.source} href={row.source}>
              {host(row.source)}
            </Source>,
          ])}
        />
        <Callout title="The pattern in the numbers">
          Visible beats hidden every time it was measured (Spotify, Facebook,
          NN/g, Redbooth). Removing the bar helps new users and hurts retained
          ones (Flipboard). Putting a product bet in the bar gets reverted
          (Instagram). Feed switching wants to be one swipeable row (Threads).
          None of these companies published what happens when you fix the
          header budget, which is why chapter 9 starts with instrumentation.
        </Callout>
      </Section>

      <Section
        title="Principles for daily.dev"
        description="Fifteen rules derived from the above. Later chapters cite them by number."
      >
        <ol className="grid gap-3 tablet:grid-cols-2">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="flex gap-3 rounded-12 border border-border-subtlest-tertiary p-4"
            >
              <span className="w-6 shrink-0 font-bold tabular-nums text-text-quaternary typo-callout">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-bold typo-callout">{principle.title}</span>
                <span className="text-text-tertiary typo-footnote">
                  {principle.body}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="2" />
      </Section>
    </Page>
  ),
};

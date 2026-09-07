import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bullets,
  CodeBlock,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
  SpecTable,
} from '../open-graph/ogStoryLayout';

const Measurement = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Google Preferred Sources · 5"
      title="What Google will tell us, what it won’t, and how this can go wrong"
    >
      Worth being blunt before anyone builds a business case on this: Google
      publishes almost nothing that a publisher can act on, and the one headline
      number it does publish is unfalsifiable as stated.
    </PageHeader>

    <Heading>The public numbers, and what each is worth</Heading>
    <SpecTable
      columns={['Google says', 'What it actually means', 'Usable?']}
      rows={[
        [
          '600,000+ unique sources selected, up from 345,000 in May and 90,000 in December 2025',
          'A count of distinct sites picked at least once. A site chosen by one reader counts the same as one chosen by a million. It measures breadth of the catalogue, not depth of adoption.',
          'No — tells us nothing about reader uptake',
        ],
        [
          'Readers “click to that site twice as much on average”',
          'No baseline disclosed, no time window, no indication whether the lift persists or decays after the novelty of selecting.',
          'No — directionally encouraging at best',
        ],
        [
          'Nothing in Search Console',
          'There is no preferred-source dimension. We cannot see how many of our readers selected us, how often a preferred badge showed, or what share of Google traffic it drove.',
          'No — this is the important one',
        ],
      ]}
    />
    <Muted>
      So the honest framing for whichever option we ship: this is a goodwill and
      positioning bet with a plausible traffic upside, not a measurable traffic
      channel. If we present it internally as the latter, we will be asked for
      numbers that do not exist.
    </Muted>

    <Divider />

    <Heading>What we can measure ourselves</Heading>
    <Muted>
      Our own click is the only number anyone will have, which makes
      instrumenting it non-optional. Both components take an{' '}
      <code>onClick</code>/<code>onAdd</code> callback for exactly this.
    </Muted>
    <CodeBlock>{`// LogEvent additions
ClickPreferredSource   = 'click preferred source',
ImpressionPreferredSource = 'impression preferred source',

// extra: { target: 'dailydev' | 'source', placement, copy, domain? }
// placement: 'post_page' | 'new_tab' | 'sidebar' | 'settings' | 'footer' | ...`}</CodeBlock>
    <Bullets
      title="The questions this can answer"
      items={[
        'Click-through on the control, split by placement — source row vs entity card vs sidebar widget.',
        'Whether readers who click it are our high-retention cohort or our churning one. If it is the former, this is a loyalty signal we can use elsewhere.',
        'Which publishers get preferred most often — genuinely useful input for partnerships and for business.daily.dev.',
        'Whether the outbound click costs us session depth, measured against a holdout.',
      ]}
    />

    <Divider />

    <Heading>Three ways this goes wrong</Heading>
    <Bullets
      tone="bad"
      items={[
        'We ship option A on post pages and it reads as a non-sequitur — a Google ask bolted onto someone else’s article. Low click-through, and it spends sidebar space that the signup widget converts better on.',
        'Option B works, and we discover we have built a well-used exit door. It is an outbound link by construction; a holdout is the only way to know what it costs, and we should run one rather than argue about it.',
        'We build for a domain Google does not list. Eligibility is not automatic — confirm daily.dev resolves in the source preferences tool before any of option A gets scoped.',
      ]}
    />

    <Heading>The one that is not a UI change</Heading>
    <Muted>
      Google has now publicly endorsed the idea daily.dev has been arguing since
      day one: readers should choose their sources, rather than have an
      algorithm choose for them. Google shipped a preferences panel buried in
      search settings; we shipped a whole product. That comparison writes
      itself, and it is the cheapest and highest-ceiling thing on this page — an
      email, a blog post, and a campaign, with no engineering dependency at all.
    </Muted>
  </Page>
);

const meta: Meta<typeof Measurement> = {
  title: 'Preferred Sources/5. Measurement & Risks',
  component: Measurement,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj<typeof Measurement> = { name: 'Measurement' };

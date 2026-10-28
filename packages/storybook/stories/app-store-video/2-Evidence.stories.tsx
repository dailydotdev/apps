import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, Table, Verdicts } from './parts';
import { evidenceRows, funnelRows } from './data';

const meta: Meta = {
  title: 'App Store Video/2. Evidence',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Evidence: StoryObj = {
  name: '2. Evidence',
  render: () => (
    <Page
      chapter="2"
      question="Does video move installs, and which of our funnel steps needs it?"
      title="Video is a test, not a lift; our loss is before the tap"
      goal="Decide which placement earns the first budget from our own funnel, not from vendor averages."
      metric="Impressions to product page views, read per treatment in App Analytics."
    >
      <Case
        title="Our funnel"
        note="iOS, April 21 to July 19, 2026, from the App Store Connect export in Smith's July report (docs/product/app-store-MASTER-REPORT.md). Nimrod is adding a fresher data layer; re-pull before the test starts."
      >
        <Table
          head={['Step', 'Value', 'vs prior 90 days', 'Read']}
          rows={funnelRows}
        />
      </Case>
      <Case title="What the funnel says about the three slots">
        <Verdicts
          items={[
            {
              label: 'Search results video',
              text: 'Plays at the step we lose 6 of 7 people. The only slot that can change impression to tap. First.',
              tone: 'good',
            },
            {
              label: 'Header video',
              text: 'The first thing a visitor sees on a page that already converts 2 in 3. Worth having because it is nearly free once the search asset exists and shares its frames.',
              tone: 'good',
            },
            {
              label: 'App preview',
              text: 'Also lands on the page. Vendors say +16% to +35%; Apple showed a loss. Build it last and only as a measured treatment.',
              tone: 'warn',
            },
          ]}
        />
      </Case>
      <Case
        title="What others measured"
        note="Vendor figures are averages over their own customers, mostly games. The Apple case study is the one controlled result in the set, and it went the other way."
      >
        <Table head={['Source', 'Result', 'Caveat']} rows={evidenceRows} />
      </Case>
      <Case title="Patterns in the results that survive the caveats">
        <Bullets
          items={[
            'The first frame does most of the work. The poster frame is what people see with autoplay off and what the search thumbnail shows for the first fraction of a second; the one poster-frame test on record beat every cut test.',
            'Videos that open on a logo, a splash or a sentence of brand lose people in the first three seconds. Every guide and Apple itself say to lead with the value moment.',
            'Muted is the default on every surface, so the footage carries the message and text only clarifies. Narration is for the few who unmute on the product page.',
            'Losses come from videos that attract the wrong people (a trailer that promises a different product) or that are too long and slow. A feed app that shows its feed does not have the first problem.',
            'Where the page already converts well, a video can only add what screenshots could not show: motion. For daily.dev that is the feed moving and a TLDR opening, which is exactly what screenshots cannot do.',
          ]}
        />
      </Case>
    </Page>
  ),
};

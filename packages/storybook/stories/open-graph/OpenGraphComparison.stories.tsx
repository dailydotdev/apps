import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LinkedInCard,
  MetaTagsTable,
  WhatsAppCard,
  XCard,
} from './platformCards';
import type { OgData } from './platformCards';
import { USE_CASES } from './useCases';
import {
  Bullets,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
  TwoCol,
} from './ogStoryLayout';

const Stack = ({ data }: { data: OgData }): React.ReactElement => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <XCard data={data} />
    <LinkedInCard data={data} />
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <WhatsAppCard data={data} />
    </div>
    <MetaTagsTable data={data} />
  </div>
);

const Comparison = (): React.ReactElement => (
  <Page>
    <PageHeader eyebrow="Open Graph · Proposal" title="Current vs. recommended">
      A side-by-side of what we ship today (the{' '}
      <strong>real, live images</strong>, pulled from the actual URLs) against a
      single, unified template system that adapts per share type. Each surface
      keeps the same visual language so a daily.dev link is instantly
      recognizable, while the headline, attribution and context change to fit
      the object being shared. Red column = today; green column = proposed.
    </PageHeader>

    {USE_CASES.map((uc, i) => (
      <section key={uc.id} id={uc.id}>
        <Heading badge={uc.source}>
          {i + 1}. {uc.name}
        </Heading>
        <Muted>{uc.what}</Muted>

        <div style={{ margin: '20px 0 28px' }}>
          <TwoCol
            leftLabel="Current"
            rightLabel="Recommended"
            left={<Stack data={uc.current} />}
            right={<Stack data={uc.recommended} />}
          />
        </div>

        <TwoCol
          leftLabel="Problems"
          rightLabel="What to change"
          left={<Bullets tone="bad" items={uc.issues} />}
          right={<Bullets tone="good" items={uc.recommendations} />}
        />

        {i < USE_CASES.length - 1 && <Divider />}
      </section>
    ))}
  </Page>
);

const meta: Meta<typeof Comparison> = {
  title: 'Open Graph/2. Current vs Recommended',
  component: Comparison,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Comparison>;

export const SideBySide: Story = { name: 'Side by side' };

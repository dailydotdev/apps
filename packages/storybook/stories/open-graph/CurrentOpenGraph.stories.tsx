import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetaTagsTable, PlatformGrid } from './platformCards';
import { USE_CASES } from './useCases';
import {
  Bullets,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
} from './ogStoryLayout';

const CurrentPreviews = (): React.ReactElement => (
  <Page>
    <PageHeader eyebrow="Open Graph · Review" title="Current share previews">
      Every place daily.dev content gets shared, rendered the way it actually
      unfurls on X, LinkedIn, Facebook, Slack, Discord, WhatsApp and iMessage.
      These are the <strong>real, live images daily.dev serves today</strong> —
      pulled straight from the actual URLs (e.g.{' '}
      <code>og.daily.dev/api/posts/&#123;id&#125;</code> for posts,{' '}
      <code>daily.dev/og-image.png</code> for the homepage), not re-creations.
      The tell is obvious: only posts get a real card — profile, source, tag,
      squad, invite and Plus all fall back to the same generic image.
    </PageHeader>

    {USE_CASES.map((uc, i) => (
      <section key={uc.id} id={uc.id} style={{ marginBottom: 8 }}>
        <Heading badge={uc.source}>
          {i + 1}. {uc.name}
        </Heading>
        <Muted>{uc.what}</Muted>

        <div style={{ margin: '16px 0 24px' }}>
          <MetaTagsTable data={uc.current} />
        </div>

        <Bullets title="Issues today" tone="bad" items={uc.issues} />

        <div style={{ marginTop: 20 }}>
          <PlatformGrid data={uc.current} />
        </div>

        {i < USE_CASES.length - 1 && <Divider />}
      </section>
    ))}
  </Page>
);

const meta: Meta<typeof CurrentPreviews> = {
  title: 'Open Graph/1. Current Share Previews',
  component: CurrentPreviews,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof CurrentPreviews>;

export const AllUseCases: Story = { name: 'All use cases' };

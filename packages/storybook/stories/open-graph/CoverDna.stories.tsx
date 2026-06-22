import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { COVER_DNA } from './coverDna';
import { Cover } from './cover';
import {
  Bullets,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
} from './ogStoryLayout';

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const label = (text: string): React.ReactElement => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--theme-text-tertiary)',
      marginBottom: 10,
    }}
  >
    {text}
  </div>
);

const CoverDna = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Open Graph · Recognizable as daily.dev"
      title="20 ways to brand the cover — fresh start"
    >
      Clean slate. Base = the <strong>clean Layout A</strong> you liked (source
      left, real logo right, cover art bottom-right, glass upvote + comment
      bar). Each variation adds <strong>one</strong> recognizability device so
      the cover instantly reads as daily.dev. Grouped into four{' '}
      <strong>systems</strong> — tell me which system feels right, then we
      refine.
    </PageHeader>

    <Heading>Baseline (no branding device)</Heading>
    <Muted>The clean cover, unchanged — everything below builds on this.</Muted>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
        gap: 30,
        marginTop: 16,
      }}
    >
      <div>
        {label('Layout A — clean')}
        <Cover />
      </div>
    </div>

    {COVER_DNA.map((cat, ci) => (
      <section key={cat.category}>
        <Divider />
        <Heading badge={`${cat.items.length} variations`}>
          {String.fromCharCode(65 + ci)}. {cat.category}
        </Heading>
        <Muted>{cat.blurb}</Muted>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
            gap: 30,
            marginTop: 16,
          }}
        >
          {cat.items.map((it) => (
            <div key={it.id}>
              {label(`${it.id.toUpperCase()} · ${it.name}`)}
              {it.Component()}
            </div>
          ))}
        </div>
      </section>
    ))}

    <Divider />
    <Heading>Pick a direction</Heading>
    <Bullets
      items={[
        'Which SYSTEM reads most “daily.dev” to you — A (frame), B (color), C (mark), or D (lockup)?',
        'Then a code within it (e.g. A1, B3, D3) and any tweak — I’ll refine just that.',
      ]}
    />
  </Page>
);

const meta: Meta<typeof CoverDna> = {
  title: 'Open Graph/7 Recognizable Covers ★',
  component: CoverDna,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof CoverDna>;

export const Recognizable: Story = { name: '20 branding devices' };

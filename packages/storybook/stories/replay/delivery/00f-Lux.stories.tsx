import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Callout, CalloutTone, Cell, Page, PageHeader, Section, Table } from '../shell';
import { ProductShell } from './product';
import { ReplayPopup } from './entry';
import {
  Aperture,
  Capsule,
  FloatingOrb,
  LitGrid,
  LuxStyles,
  MarkOnly,
  Orb,
  OrbEntry,
  Plaque,
  Rings,
  Seal,
  SealEntry,
  Stack,
  Tile,
  Wordless,
} from './lux';

const meta: Meta = {
  title: 'Replay delivery/00f. The aurora, small and expensive',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The aurora reduced to a compact object: black lacquer, a hairline edge, the week moving under glass, and one abstract mark that says there is something about you inside. No card is shown before the click.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Row = ({ label, note, children }: { label: string; note?: string; children: ReactNode }): ReactElement => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-5 py-4">{children}</div>
    <span className="font-bold text-text-primary typo-footnote">{label}</span>
    {note && <span className="max-w-[40ch] text-text-tertiary typo-caption1">{note}</span>}
  </div>
);

export const Lux: Story = {
  name: 'Eight objects',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
          <LuxStyles />
          <PageHeader eyebrow="Replay delivery · the aurora, reduced" title="Small, dark, and lit from inside">
            <p>
              The aurora you liked, with everything taken away except the
              material. Black lacquer, a one-pixel edge, a lit top lip, and the
              week&apos;s colours drifting under glass. Never a card. Inside each
              object is one mark that says the same thing without a word:
              there is something about you in here. Eight objects at the sizes
              they would actually ship, and the marks and the copy on their own
              so they can be judged separately.
            </p>
          </PageHeader>

          <Section title="The marks" description="Six ways to say 'a highlight about you' without showing one. Each is the week's colours behind an abstract shape; none is a card.">
            <div className="flex flex-wrap items-end gap-8 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
              {[
                ['The orb', 'The week under a glass dome. Insight, held.', <Orb key="o" size={44} />],
                ['The rings', 'A signal going out from a point. Something is being said.', <Rings key="r" size={40} />],
                ['The lit grid', 'Nine, five lit. Five highlights, none shown.', <LitGrid key="g" size={40} />],
                ['The stack', 'Three squares, the top one alive. A set, face down.', <Stack key="s" size={44} />],
                ['The seal', 'The week number in a thin ring. Sealed until you open it.', <Seal key="e" size={44} />],
                ['The aperture', 'A slit of colour in black. Something to look into.', <Aperture key="a" size={44} />],
              ].map(([name, note, mark]) => (
                <div key={String(name)} className="flex w-40 flex-col items-center gap-3 text-center">
                  <span className="flex h-16 items-center justify-center rounded-16 px-4" style={{ background: '#0B0B0F', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)' }}>
                    {mark}
                  </span>
                  <span className="font-bold text-text-primary typo-footnote">{name}</span>
                  <span className="text-text-tertiary typo-caption1">{note}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="1 · The plaque" description="A small lacquer tile above the feed, right-aligned, not a strip. The mark, one line, one small line. Two hundred and thirty pixels wide.">
            <ProductShell count={6} above={<div className="flex justify-end"><Plaque onOpen={go} /></div>} />
            <div className="flex flex-wrap items-start gap-6">
              <Row label="Six marks in the same plaque" note="The tile stays the same; only the mark changes. The orb reads as the most luxurious, the grid as the most informative.">
                {(['orb', 'rings', 'grid', 'stack', 'seal', 'aperture'] as const).map((mark) => (
                  <Plaque key={mark} onOpen={go} mark={mark} width={212} />
                ))}
              </Row>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              <Row label="Three sizes" note="Small enough for the tabs row, large enough to be a Monday object. All the same object.">
                <Plaque onOpen={go} width={180} sub="5 highlights" />
                <Plaque onOpen={go} width={232} />
                <Plaque onOpen={go} width={300} line="Your week 37, read back to you" sub="5 highlights · 40 seconds" />
              </Row>
            </div>
          </Section>

          <Section title="2 · The orb in the header" description="Thirty pixels. It sits next to the streak flame and says nothing until hovered; then one line slides out. The smallest door that still feels like an object.">
            <ProductShell count={6} headerRight={<OrbEntry onOpen={go} />} />
            <Callout tone={CalloutTone.Neutral} title="Hover it in the header">
              <p>At rest it is a dark sphere with colour moving in it. On hover the line appears. On Tuesday it is still there; it is the header's own weather.</p>
            </Callout>
          </Section>

          <Section title="3 · The tile" description="A square. The mark, one word. It sits where a post would not: in the rail under the navigation, or in the corner of the feed.">
            <ProductShell count={6} railChildren={<div className="mt-3 px-1"><Tile onOpen={go} mark="rings" /></div>} />
            <div className="flex flex-wrap items-start gap-6">
              <Row label="Four tiles" note="The word under the mark is the only copy. Highlights, Your week, W37, or nothing.">
                <Tile onOpen={go} mark="rings" word="Highlights" />
                <Tile onOpen={go} mark="grid" word="Your week" />
                <Tile onOpen={go} mark="aperture" word="W37" />
                <Tile onOpen={go} mark="stack" word="Replay" />
              </Row>
            </div>
          </Section>

          <Section title="4 · The seal in the tabs" description="The week number in a thin ring, lacquer behind it, 'Your week' beside it. Lives with For you and Popular, at their height.">
            <ProductShell count={6} tabsChildren={<SealEntry onOpen={go} />} />
          </Section>

          <Section title="5 · The capsule on the edge" description="A narrow vertical capsule on the feed's right edge, the rings at the top, the week number written down its side. Takes nothing from the grid.">
            <ProductShell count={6} overlay={<Capsule onOpen={go} />} />
          </Section>

          <Section title="6 · The floating orb" description="The floating one you liked, reduced to the orb and a whisper. Bottom right, follows the scroll, gone when opened.">
            <ProductShell count={6} overlay={<FloatingOrb onOpen={go} />} />
          </Section>

          <Section title="7 · The mark alone" description="Twenty-eight pixels in the header, no copy at all. The lit grid, the orb, or the aperture. A door only for people who have learned it, which after two Mondays is everyone.">
            <ProductShell count={6} headerRight={<><MarkOnly onOpen={go} mark="grid" /><MarkOnly onOpen={go} mark="orb" /><MarkOnly onOpen={go} mark="aperture" /></>} />
          </Section>

          <Section title="8 · Wordless" description="The aperture, the week number, the mark. A pill with no sentence on it. The most confident version, and the one that needs the notification row to carry the claim.">
            <ProductShell count={6} above={<div className="flex justify-end"><Wordless onOpen={go} /></div>} />
          </Section>

          <Section title="The copy, on its own">
            <Table
              head={['Line', 'Second line', 'Tone', 'Verdict']}
              minWidth={60}
              rows={[
                ['Your week 37', '5 highlights', 'Factual, owned', 'Ship. Says whose, which, and how many, in four words.'],
                ['Your week, read back to you', '5 highlights · 40 seconds', 'Warm', 'Test. The best sentence here, but eight words on a small object.'],
                ['There is something about you in here', 'Week 37', 'Curiosity', 'Test on Monday only. Strong once, cloying weekly.'],
                ['Highlights', 'W37', 'Minimal', 'Ship on the tile and the capsule.'],
                ['W37', 'none', 'Wordless', 'Ship once the object is learned; pair with the notification row.'],
                ['Your Replay is ready', 'Tap to open', 'Announcement', 'No. It is the sentence every recap uses.'],
              ]}
            />
          </Section>

          <Section title="The material">
            <div className="grid gap-4 tablet:grid-cols-3">
              <Cell label="Lacquer" note="#0B0B0F">
                <p className="text-text-tertiary typo-footnote">Near black, never the theme&apos;s grey. A one-pixel edge at 14% white, a lit top lip at 22%. Deep shadow underneath so it sits on the page rather than in it.</p>
              </Cell>
              <Cell label="The aurora, contained" note="three hues, blurred, screen blend">
                <p className="text-text-tertiary typo-footnote">The week&apos;s top three topic colours, blurred to fog, drifting slowly, always clipped by the object. It is the only colour on the object; everything else is white at some opacity.</p>
              </Cell>
              <Cell label="Type" note="mono small caps, one bold line">
                <p className="text-text-tertiary typo-footnote">Ten-pixel mono in small caps with wide tracking for labels; one bold line of the product face for the sentence. Never two sentences.</p>
              </Cell>
            </div>
            <Callout tone={CalloutTone.Good} title="Why this is more powerful than the wide aurora">
              <p>
                A band across the feed is decoration; a small dark object with
                light inside it is a thing. It does not compete with posts
                because it is not shaped like one, it does not show the card
                because the mark stands for it, and it is the same object every
                week, so the eye learns it and the week&apos;s colours become the
                only thing that changes.
              </p>
            </Callout>
          </Section>

          <Section title="The pick">
            <div className="grid gap-4 tablet:grid-cols-3">
              <Cell label="Always" note="2 · the orb in the header">
                <p className="text-text-tertiary typo-footnote">Thirty pixels next to the streak. It is the week&apos;s weather, and it opens the deck.</p>
              </Cell>
              <Cell label="Monday" note="1 · the plaque, orb mark">
                <p className="text-text-tertiary typo-footnote">Right-aligned above the feed, &quot;Your week 37 · 5 highlights&quot;, once, until opened.</p>
              </Cell>
              <Cell label="Mobile" note="6 · the floating orb">
                <p className="text-text-tertiary typo-footnote">The orb and a whisper, bottom right. The floating one, finished.</p>
              </Cell>
            </div>
          </Section>
        </Page>
      </>
    );
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Callout, CalloutTone, Cell, Page, PageHeader, Section, Table } from '../shell';
import { ReplayPopup } from './entry';
import { LuxStyles, Plaque, Wordless } from './lux';
import { FeedFrame, Scaled, WidthRow, WIDTHS } from './responsive';

const meta: Meta = {
  title: 'Replay delivery/00h. Full size, every resolution',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The full-size object placed in the one region both layouts share at every width: the head of the feed column. Four positions across five widths in both layouts, a space audit, and the pick.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const FullButton = ({ onOpen, wide = false }: { onOpen: () => void; wide?: boolean }): ReactElement => (
  <Plaque onOpen={onOpen} mark="seal" line="Your week 37" sub={wide ? '5 highlights · 40 seconds' : '5 highlights · 40s'} width={wide ? 300 : 248} />
);

const Candidate = ({ letter, title, idea, node, fits, fails, slot }: { letter: string; title: string; idea: string; node: ReactNode; fits: string; fails: string; slot: 'topRight' | 'topLeft' | 'topCenter' | 'floating' | 'stickyTop' }): ReactElement => (
  <Section title={`${letter} · ${title}`} description={idea}>
    <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">New layout · v2 rail</span>
    <WidthRow layout="v2" slot={slot} node={node} />
    <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">Old layout · header and sidebar</span>
    <WidthRow layout="classic" slot={slot} node={node} />
    <div className="grid gap-4 tablet:grid-cols-2">
      <Callout tone={CalloutTone.Good} title="Where it has room">
        <p>{fits}</p>
      </Callout>
      <Callout tone={CalloutTone.Bad} title="Where it runs out">
        <p>{fails}</p>
      </Callout>
    </div>
  </Section>
);

export const Position: Story = {
  name: 'Four positions, five widths, two layouts',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    const button = <FullButton onOpen={go} />;
    const wordless = <Wordless onOpen={go} />;
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
          <LuxStyles />
          <PageHeader eyebrow="Replay delivery · position" title="The one region both layouts share">
            <p>
              The header, the rail and the sidebar are all different between the
              old layout and the new one, and all of them lose room as the
              window narrows. The one region that exists in both, at every
              width, with the same shape, is the head of the feed column: the
              space between the feed&apos;s top edge and its first row of
              cards. It is where the Highlight card already goes, where the
              activation bar went, and it is as wide as the feed at every
              breakpoint. So the full-size object goes there, and this page
              shows it at every width the product serves, in both layouts, in
              four positions.
            </p>
          </PageHeader>

          <Section title="The object, full size" description="The seal, the line, the small line: 248 pixels wide, 52 tall. The wordless pill beside it for comparison. Neither is a strip; both are objects with air around them.">
            <div className="flex flex-wrap items-center gap-6 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
              {button}
              <FullButton onOpen={go} wide />
              {wordless}
            </div>
          </Section>

          <Candidate
            letter="A"
            title="Head of the feed, right-aligned"
            idea="A row above the first cards, the object on the right, aligned with the feed's right edge. On a phone the row is the same and the object keeps its size, right-aligned under the chips."
            slot="topRight"
            node={button}
            fits="Every width, both layouts. The row is as wide as the feed, so there is always room for 248 pixels, and right-aligned it sits under the feed's own controls where the eye already goes for actions. On a phone the object fits with 120 pixels to spare."
            fails="A row above the cards is a row the cards move down for: 52 pixels plus the gap. Right-aligned, it can read as a control rather than a thing; the seal and the lacquer are what stop that."
          />

          <Candidate
            letter="B"
            title="Head of the feed, left-aligned"
            idea="The same row, the object at the feed's left edge, where the first card starts. It leads the feed instead of sitting beside its controls."
            slot="topLeft"
            node={button}
            fits="Same room as A at every width. Left-aligned it is the first thing in the reading order, and it lines up with the first card's edge, which makes it look placed rather than floated."
            fails="It sits directly under For you and the tabs, so on the classic layout it can read as a sixth tab. On a phone it is identical to A."
          />

          <Candidate
            letter="C"
            title="Head of the feed, centred"
            idea="The object centred above the grid. On wide screens it sits in the middle of five columns; on a phone it is centred under the chips."
            slot="topCenter"
            node={button}
            fits="Centred is the only position that reads the same at 390 and at 1920: the object always sits over the middle of the feed with equal air on both sides, so it never looks pushed to a corner."
            fails="Centred elements in a left-aligned interface read as announcements. On the classic layout, with tabs on the left and controls on the right, a centred object floats between two anchors."
          />

          <Candidate
            letter="D"
            title="Floating, bottom right"
            idea="The full-size object floating over the feed, bottom right, above the phone's tab bar. No row, no layout dependency."
            slot="floating"
            node={button}
            fits="It is the only position that costs the feed nothing and is identical in both layouts, because it is anchored to the viewport, not to the layout. Follows the scroll; gone when opened."
            fails="It covers content in the last column at every width above a phone, and on a phone it sits over the card actions. It also competes with the Support button in the classic layout's corner."
          />

          <Section title="Space audit" description="Room available for the 248px object in each position, at each width, in each layout. Room is the width of the region minus what already lives in it.">
            <Table
              head={['Width', 'Columns', 'Feed width (v2)', 'Feed width (classic)', 'A · right', 'B · left', 'C · centre', 'D · floating']}
              minWidth={72}
              rows={WIDTHS.map(({ label, width }) => {
                const cols = width < 768 ? 1 : width < 1024 ? 2 : width < 1440 ? 3 : width < 1920 ? 4 : 5;
                const v2 = width < 1024 ? width - 24 : width - (width < 1280 ? 64 : 64) - 24 - 40;
                const classic = width < 1024 ? width - 24 : width - 240 - 40;
                const ok = (room: number) => (room >= 248 ? `fits · ${room}px` : `tight · ${room}px`);
                return [
                  `${label} · ${width}`,
                  String(cols),
                  `${v2}px`,
                  `${classic}px`,
                  ok(Math.min(v2, classic)),
                  ok(Math.min(v2, classic)),
                  ok(Math.min(v2, classic)),
                  width < 768 ? 'over the card actions' : 'over the last column',
                ];
              })}
            />
            <Callout tone={CalloutTone.Neutral} title="How the room is counted">
              <p>
                v2: the window minus the 64px rail, the 24px page padding and
                the 40px card padding. Classic: the window minus the 240px
                sidebar and the 40px padding. Below 1024 both layouts drop the
                rail and the sidebar for the mobile top, so the feed is the
                window minus 24px. The object needs 248px; the narrowest feed
                is 366px on a phone.
              </p>
            </Callout>
          </Section>

          <Section title="The pick">
            <div className="grid gap-4 tablet:grid-cols-3">
              <Cell label="Position" note="A · head of the feed, right-aligned">
                <p className="text-text-tertiary typo-footnote">One row above the first cards, the object at the feed&apos;s right edge, in both layouts and at every width. The only region that exists everywhere with the same shape.</p>
              </Cell>
              <Cell label="Size" note="248 × 52, never scaled">
                <p className="text-text-tertiary typo-footnote">The object keeps its size from 390 to 1920. The row it sits in is as wide as the feed, so it never has to shrink, wrap or hide.</p>
              </Cell>
              <Cell label="Lifecycle" note="Monday full, then the seal">
                <p className="text-text-tertiary typo-footnote">The full object on Monday until opened. From Tuesday the same row holds the seal alone, 32px, right-aligned, and the cards move back up by 20px.</p>
              </Cell>
            </div>
            <Callout tone={CalloutTone.Good} title="Why this and not the header, rail or sidebar">
              <p>
                Those three are different between the layouts and all of them
                lose room first when the window narrows: the classic header&apos;s
                search panel gives way at laptop width, the v2 rail goes compact
                below 1280, the sidebar disappears below 1024. The head of the
                feed column is the same element in both layouts, at every
                width, and the feed is the one thing that never gets narrower
                than a phone.
              </p>
            </Callout>
            <div className="flex flex-col gap-3">
              <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">The pick at laptop width, both layouts, true size</span>
              <Scaled width={1280} height={520} into={1100}>
                <FeedFrame layout="v2" width={1280} slot="topRight" node={button} height={520} />
              </Scaled>
              <Scaled width={1280} height={520} into={1100}>
                <FeedFrame layout="classic" width={1280} slot="topRight" node={button} height={520} />
              </Scaled>
            </div>
          </Section>
        </Page>
      </>
    );
  },
};

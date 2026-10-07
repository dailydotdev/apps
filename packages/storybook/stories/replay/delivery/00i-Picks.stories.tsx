import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Callout, CalloutTone, Cell, Page, PageHeader, PhoneFrame, Section } from '../shell';
import { ReplayPopup } from './entry';
import { LuxStyles } from './lux';
import { FeedFrame, Scaled, WidthRow } from './responsive';
import type { Slot } from './responsive';
import { Band, ColumnTile, GlintRow, HeaderPlate, MarkRow, PullToReplay, RectPlaque, SlotTile } from './picked';

const meta: Meta = {
  title: 'Replay delivery/00i. The picks',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The mobile pick, saved as a working component that opens the deck. The desktop object again: the circle replaced by a rectangle, lit by a brighter sheen. Two kept: the band and the slot.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/* -------------------------------------------------------------------------- */
/* Mobile                                                                      */
/* -------------------------------------------------------------------------- */

export const Mobile: Story = {
  name: 'Mobile · pull to reveal (saved)',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
          <PageHeader eyebrow="Replay delivery · the mobile pick" title="Pull to reveal">
            <p>
              Saved as decided. On Monday the feed hides the Replay above its
              own top edge: a purple sliver under the header says the week is
              in. Pull the feed down and the hero card rises with it; past the
              threshold the sliver says release; let go and the deck opens as
              the pop-up. Below the threshold the feed springs back and the
              sliver stays until it is opened. Drag it with the mouse.
            </p>
          </PageHeader>

          <Section title="Live" description="One component, wired to the same pop-up deck as every other door.">
            <div className="flex flex-wrap items-start gap-8">
              <PhoneFrame>
                <PullToReplay onOpen={() => setOpen(true)} />
              </PhoneFrame>
              <div className="flex max-w-[24rem] flex-col gap-4">
                <Cell label="Gesture" note="Pull, past 110px, release">
                  <p className="text-text-tertiary typo-footnote">The pull moves at 0.8 of the finger, caps at 180px. The card scales from 55% to full and settles as it comes. Release past the threshold opens the deck; under it, spring back.</p>
                </Cell>
                <Cell label="At rest" note="A 44px sliver, one line">
                  <p className="text-text-tertiary typo-footnote">The sliver sits between the chip row and the first card. It costs the feed 44px on Monday and nothing after the deck has been opened.</p>
                </Cell>
                <Cell label="Pairs with" note="A push at 08:00 Monday">
                  <p className="text-text-tertiary typo-footnote">The notification lands the person on the feed; the sliver is what they see; the pull is theirs. Nothing else is needed on mobile.</p>
                </Cell>
                <Callout tone={CalloutTone.Good} title="Why this was the pick">
                  <p>The only door where the person physically pulls the week into view, with a gesture they already make every morning. It shows nothing until pulled and never blocks the feed.</p>
                </Callout>
              </div>
            </div>
          </Section>

          <Section title="The states" description="At rest, mid-pull, and past the threshold. The same component, held at three pulls.">
            <div className="flex flex-wrap items-start gap-6">
              {[0, 70, 150].map((pull) => (
                <div key={pull} className="flex flex-col gap-2">
                  <PhoneFrame>
                    <PullToReplay onOpen={() => setOpen(true)} height={560} frozen={pull} />
                  </PhoneFrame>
                  <span className="font-mono text-text-quaternary typo-caption2">{pull === 0 ? 'at rest · 44px sliver' : pull === 70 ? 'mid-pull · 70px · the card rising' : 'past the threshold · 150px · release opens'}</span>
                </div>
              ))}
            </div>
          </Section>
        </Page>
      </>
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Desktop                                                                     */
/* -------------------------------------------------------------------------- */

const Both = ({ slot, node, width = 1280, height = 500, into = 1100 }: { slot: Slot; node: ReactNode; width?: number; height?: number; into?: number }): ReactElement => (
  <div className="flex flex-col gap-3">
    <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">New layout · v2 rail · {width}px</span>
    <Scaled width={width} height={height} into={into}>
      <FeedFrame layout="v2" width={width} slot={slot} node={node} height={height} />
    </Scaled>
    <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">Old layout · header and sidebar · {width}px</span>
    <Scaled width={width} height={height} into={into}>
      <FeedFrame layout="classic" width={width} slot={slot} node={node} height={height} />
    </Scaled>
  </div>
);

const Option = ({ number, title, idea, slot, node, good, bad }: { number: number; title: string; idea: string; slot: Slot; node: ReactNode; good: string; bad: string }): ReactElement => (
  <Section title={`${number} · ${title}`} description={idea}>
    <Both slot={slot} node={node} />
    <div className="grid gap-4 tablet:grid-cols-2">
      <Callout tone={CalloutTone.Good} title="What it does well">
        <p>{good}</p>
      </Callout>
      <Callout tone={CalloutTone.Bad} title="What it costs">
        <p>{bad}</p>
      </Callout>
    </div>
  </Section>
);

export const Desktop: Story = {
  name: 'Desktop · rectangle, integrated, lit',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
          <LuxStyles />
          <PageHeader eyebrow="Replay delivery · the desktop, again" title="A rectangle in the product, lit">
            <p>
              The circle went. The mark is now rectangular: the back of a card,
              a fan of three, a ledger of the week&apos;s five topics, or a
              plate with the week&apos;s number. The object keeps the lacquer,
              but it now sits inside the product&apos;s own geometry, and it
              asks for attention with light rather than size: a brighter,
              faster sheen. Two are kept: the band, the full width of the feed
              above the first row, and the slot, one dark card in the grid.
              Every object opens the pop-up deck.
            </p>
          </PageHeader>

          <Section title="The marks" description="Four rectangular marks. None shows a card; each says there is something about you in here.">
            <MarkRow />
            <div className="grid gap-4 tablet:grid-cols-4">
              <Cell label="card" note="The back of one card"><p className="text-text-tertiary typo-footnote">4:5, the week under it, a hairline inset. The most literal: a card, face down.</p></Cell>
              <Cell label="fan" note="Three backs, fanned"><p className="text-text-tertiary typo-footnote">A hand of cards. Reads as a set at a glance.</p></Cell>
              <Cell label="ledger" note="Five bars, the week's topics"><p className="text-text-tertiary typo-footnote">Kubernetes 63%, Rust 17% and so on, as lit bars. Data, not decoration.</p></Cell>
              <Cell label="plate" note="The week's number"><p className="text-text-tertiary typo-footnote">37 on a lacquer plate. The seal, squared.</p></Cell>
            </div>
          </Section>

          <Section title="The light" description="Three ways the same object asks for the eye. Hover any of them; all open the deck.">
            <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
              <GlintRow onOpen={go} />
            </div>
            <Callout tone={CalloutTone.Neutral} title="Which light">
              <p>
                The slow sweep is what the lacquer objects had; it is a material
                effect, easy to miss. The bright sweep is a signal: twice as
                often, twice as white, still contained inside the object. The
                edge glow is the loudest and the only one that spills outside
                the object into the page. Bright is the default below.
              </p>
            </Callout>
          </Section>

          <Option
            number={1}
            title="The band · kept"
            idea="The full width of the feed, one row tall, under the header. The fan mark on the left, the line, five unlit ticks for the five highlights, the time on the right. The sheen crosses the whole width."
            slot="band"
            node={<Band onOpen={go} />}
            good="The most dominant thing on the page without being tall: 52px across every column. It aligns with the grid's outer edges in both layouts and reads as part of the feed's furniture, like the highlight row."
            bad="A band is a banner if the copy is loud. It stays quiet here, but it is the one option that could tip into an announcement."
          />

          <Option
            number={2}
            title="The slot · kept"
            idea="The first cell of the grid, the size of a post. The fan of backs in the middle, the line, and Open as the primary button. The feed's own geometry holds it."
            slot="gridFirst"
            node={<SlotTile onOpen={go} />}
            good="Integrated by definition: it is a card in the grid, the same radius and size, and one dark card among light ones is impossible to miss. Nothing is drawn over the feed."
            bad="It costs a post's worth of space on Monday and leaves a hole when it goes. On wide screens it is one of five; on a laptop one of three."
          />

          <Section title="Both, at every width" description="The two kept objects across the five widths the product serves, in both layouts. Below 1024 the phone gets pull to reveal instead; these frames only show that the space holds.">
            <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">The band · new layout</span>
            <WidthRow layout="v2" slot="band" node={<Band onOpen={go} />} />
            <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">The band · old layout</span>
            <WidthRow layout="classic" slot="band" node={<Band onOpen={go} />} />
            <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">The slot · new layout</span>
            <WidthRow layout="v2" slot="gridFirst" node={<SlotTile onOpen={go} />} />
            <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">The slot · old layout</span>
            <WidthRow layout="classic" slot="gridFirst" node={<SlotTile onOpen={go} />} />
          </Section>

          <Section title="How the two could share the week">
            <div className="grid gap-4 tablet:grid-cols-3">
              <Cell label="Monday" note="The band">
                <p className="text-text-tertiary typo-footnote">The week lands as the band: full width, bright sheen, above the first row. It is the announcement, and it goes the moment the deck is opened.</p>
              </Cell>
              <Cell label="Tuesday to Sunday" note="The slot">
                <p className="text-text-tertiary typo-footnote">If the band was not opened, or for coming back to the deck, the slot holds the door in the grid as one dark card, sheen on until opened, then a quiet card until next Monday.</p>
              </Cell>
              <Cell label="Or" note="One or the other, tested">
                <p className="text-text-tertiary typo-footnote">The two are the same door in two shapes. If they are not to be sequenced, run them against each other on Monday opens and keep the winner.</p>
              </Cell>
            </div>
          </Section>

          <Section title="Also explored" description="Three more ways the rectangle sat in the product. Not kept; here so the reasoning stays visible.">
            <div className="grid gap-4 laptop:grid-cols-3">
              <Cell label="The plaque, squared" note="248 × 52, head of the feed, right">
                <div className="flex flex-col gap-3">
                  <RectPlaque onOpen={go} />
                  <p className="text-text-tertiary typo-footnote">The last round&apos;s pick with the card&apos;s back where the seal was. Still an object beside the feed rather than in it.</p>
                </div>
              </Cell>
              <Cell label="The plate in the header row" note="36px, beside the feed's name">
                <div className="flex flex-col gap-3">
                  <div className="flex"><HeaderPlate onOpen={go} /></div>
                  <p className="text-text-tertiary typo-footnote">Lives with the feed&apos;s controls, costs the grid nothing, and is the smallest of the five. Sitting with the filter buttons it reads as a control.</p>
                </div>
              </Cell>
              <Cell label="The column" note="One grid column wide, 56px">
                <div className="flex flex-col gap-3">
                  <div style={{ width: 300 }}><ColumnTile onOpen={go} /></div>
                  <p className="text-text-tertiary typo-footnote">Sized by the grid, on the first card&apos;s edge. Its size follows the column, not the object.</p>
                </div>
              </Cell>
            </div>
          </Section>
        </Page>
      </>
    );
  },
};

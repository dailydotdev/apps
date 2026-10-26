import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Case, Page } from '../../parts';
import { AdSlot } from '../adSlot';
import { SizedCell } from '../review';
import {
  longTip,
  TipLine,
  TipsPage,
  TipsPageToday,
  TipsRemovedToast,
  TipStrip,
  TipToday,
  tips,
  tipsFor,
} from '../tips';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Tips',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** The ad slot, Tall, with whatever sits over the ad. */
const Slot = ({
  caption,
  top,
  isEditing,
}: {
  caption: string;
  top?: ReactNode;
  isEditing?: boolean;
}): ReactElement => (
  <SizedCell size="m" caption={caption} isBare>
    <AdSlot top={top} isEditing={isEditing} className="h-full" />
  </SizedCell>
);

const Row = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
    <div className="flex max-w-[56rem] flex-col gap-0.5">
      <h3 className="font-bold text-text-primary typo-body">{title}</h3>
      {note && <p className="text-text-tertiary typo-callout">{note}</p>}
    </div>
    <div className="flex flex-wrap items-start gap-8">{children}</div>
  </section>
);

const Column = ({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex w-[17.25rem] flex-col gap-2">
    <figcaption className="text-text-tertiary typo-footnote">
      {caption}
    </figcaption>
    {children}
  </figure>
);

export const Tips: StoryObj = {
  name: 'Tips',
  render: () => (
    <Page
      chapter="Widgets"
      question="How should daily.dev tips sit over our ad slot?"
      title="Tips"
      goal="Production shows one daily.dev tip over the rail's ad slot, picked at random per page view, with All tips leading to /tips. Make it read as part of the rail, quieter than the ad it sits on, and give the reader a reason to look at more than one tip."
      metric="Tip clicks per impression, All tips clicks, and how many readers remove the tips, with ad viewability held flat."
    >
      <Case
        title="What changes"
        note="Today the tip is a second washed card over the ad card: its own border, a color wash and a glow, a solid icon tile with a shadow, the eyebrow in the tip's color, and four lines of text in 112px. All tips only appears on hover with a mouse, and the reader sees one random tip per visit. The proposal keeps the slot's height and production's tips, and changes the voice: one quiet surface, the icon on a soft tile of its color, the title as the one thing to read, the category and All tips always in sight on the line under it, and arrows to step through the tips in place."
      >
        <span />
      </Case>

      <Case title="In the ad slot">
        <div className="flex flex-col gap-8">
          <Row
            title="Today and proposed"
            note="Same tip, same slot. The one-line option gives the ad almost all of the slot back."
          >
            <Slot caption="Today" top={<TipToday tip={tips[0]} />} />
            <Slot
              caption="Today, hovered (All tips shows)"
              top={<TipToday tip={tips[0]} isAllTipsShown />}
            />
            <Slot caption="Proposed" top={<TipStrip />} />
            <Slot
              caption="Proposed, one line"
              top={<TipLine tip={tips[0]} />}
            />
          </Row>
          <Row
            title="Edit mode and removal"
            note="In edit mode the tip can be removed but not moved; the ad stays pinned. Removing it gives the ad the whole slot and a toast with Undo; the tips page offers to bring them back."
          >
            <Slot
              caption="Edit mode"
              isEditing
              top={<TipStrip isEditing onRemove={() => undefined} />}
            />
            <Slot caption="Removed" />
            <Column caption="The toast">
              <TipsRemovedToast />
            </Column>
          </Row>
        </div>
      </Case>

      <Case
        title="Every tip"
        note="All twelve of production's tips in the proposed strip, so each title can be checked at its real width. The extension tip opens the store in a new tab, so it carries the external mark; inside the extension it never shows."
      >
        <div className="flex flex-col gap-8">
          <Row title="The twelve tips">
            {tips.map((tip, index) => (
              <Column key={tip.id} caption={tip.eyebrow}>
                <TipStrip initialIndex={index} />
              </Column>
            ))}
          </Row>
          <Row
            title="Edge cases"
            note="A title long enough to wrap stops at two lines. In the extension the pager counts eleven tips."
          >
            <Column caption="A long title">
              <TipStrip list={[longTip]} />
            </Column>
            <Column caption="Today, the same long title">
              <TipToday tip={longTip} />
            </Column>
            <Column caption="In the extension">
              <TipStrip list={tipsFor(true)} />
            </Column>
          </Row>
        </div>
      </Case>

      <Case
        title="The tips page"
        note="Today: twelve washed cards, each with its own accent, in one long column. Proposed: grouped like settings (Your feed, Read and save, Community, Habits), one quiet row per tip with its glyph and the way in, so the page reads as a list rather than twelve banners. When the reader has removed tips from the rail, the page offers to bring them back first."
      >
        <div className="flex flex-wrap items-start gap-10">
          <Column caption="Today">
            <div className="w-[36rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
              <TipsPageToday />
            </div>
          </Column>
          <div className="flex flex-col gap-10">
            <Column caption="Proposed">
              <div className="w-[36rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
                <TipsPage />
              </div>
            </Column>
            <Column caption="Proposed, after removing tips from the rail (extension)">
              <div className="w-[36rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
                <TipsPage isExtension isTipsHidden />
              </div>
            </Column>
          </div>
        </div>
      </Case>
    </Page>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Case, Page } from '../../parts';
import { AdSlot } from '../adSlot';
import { SizedCell } from '../review';
import {
  longTip,
  TipCopyTable,
  TipsPage,
  TipsPageToday,
  TipsRemovedToast,
  TipStrip,
  TipToday,
  tips,
  tipsFor,
} from '../tips';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Tips',
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

const extensionTips = tipsFor(true);

export const Tips: StoryObj = {
  name: 'Tips',
  render: () => (
    <Page
      chapter="Widgets"
      question="How should daily.dev tips sit over our ad slot?"
      title="Tips"
      goal="Production shows one daily.dev tip over the rail's ad slot, picked at random per page view, linking to /tips. Make each tip explicit enough to act on: what it is, what to do, and the one button that does it, with All tips always in reach."
      metric="Tip action clicks per impression, All tips clicks, and how many readers remove the tips, with ad viewability held flat."
    >
      <Case
        title="What changes"
        note="Today the tip is a second washed card over the ad card (border, wash, glow, solid icon with a shadow, tinted eyebrow), its explanation is cut to two lines, and All tips only appears on hover with a mouse. The proposal copies Polymarket’s promo cards: a glyph and a few words of title on the left with All tips as small text across from it, then one line of what to do on the left and a soft neutral button on the right. The tip’s color lives only in a wash behind. Every tip gets short, explicit copy for the rail; the tips page keeps the long copy."
      >
        <span />
      </Case>

      <Case
        title="The copy"
        note="Production’s copy is written for a page, not a strip. On the rail each tip gets a title of two or three words, one line of what to do, and a verb on the button. The long copy stays on the tips page."
      >
        <TipCopyTable />
      </Case>

      <Case title="In the ad slot">
        <div className="flex flex-col gap-8">
          <Row
            title="Today and proposed"
            note="Same slot, shorter than today, so the ad gets more of it."
          >
            <Slot caption="Today" top={<TipToday tip={tips[0]} />} />
            <Slot
              caption="Today, hovered (All tips shows)"
              top={<TipToday tip={tips[0]} isAllTipsShown />}
            />
            <Slot caption="Proposed" top={<TipStrip tip={tips[0]} />} />
            <Slot
              caption="Proposed, a longer tip"
              top={<TipStrip tip={tips[5]} />}
            />
          </Row>
          <Row
            title="Edit mode and removal"
            note="In edit mode the tip can be removed but not moved; the ad stays pinned. Removing it gives the ad the whole slot and a toast with Undo; the tips page offers to bring them back."
          >
            <Slot
              caption="Edit mode"
              isEditing
              top={
                <TipStrip tip={tips[0]} isEditing onRemove={() => undefined} />
              }
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
        note="All twelve of production's tips in the proposed design, at real width. The extension tip opens the store in a new tab, so its button carries the external mark; inside the extension it never shows."
      >
        <div className="flex flex-col gap-8">
          <Row title="The twelve tips">
            {tips.map((tip) => (
              <Column key={tip.id} caption={tip.eyebrow}>
                <TipStrip tip={tip} />
              </Column>
            ))}
          </Row>
          <Row
            title="Edge cases"
            note="A long title stops at one line and the line of what to do at two, so the tip keeps its height. In the extension the store tip is left out of the pick."
          >
            <Column caption="A long title">
              <TipStrip tip={longTip} />
            </Column>
            <Column caption="Today, the same long title">
              <TipToday tip={longTip} />
            </Column>
            <Column caption={`In the extension: ${extensionTips.length} tips`}>
              <TipStrip tip={extensionTips[0]} />
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

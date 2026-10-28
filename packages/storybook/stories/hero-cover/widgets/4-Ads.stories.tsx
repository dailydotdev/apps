import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page, Stage } from '../parts';
import { Shelf } from './shelf';
import { WidgetContent, WidgetSurface } from './catalog';
import { HeroInFeed } from './frame';
import { COLUMNS, HomeScreen, SponsoredSkins, w } from './directions';

const meta: Meta = {
  title: 'Hero Cover/Archive/Widget exploration/4. Ads & promotion',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** Our own features arrive as suggestions the reader can keep or dismiss. */
const Suggested = (): React.ReactElement => (
  <div className="relative flex min-h-0 flex-1 flex-col">
    <WidgetSurface className="flex-1 ring-1 ring-accent-onion-default">
      <WidgetContent kind="briefing" size="m" />
    </WidgetSurface>
    <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-12 bg-surface-float p-2 backdrop-blur-md">
      <span className="flex-1 text-text-secondary typo-caption1">
        Suggested by daily.dev
      </span>
      <button
        type="button"
        className="h-6 rounded-8 bg-text-primary px-2 font-bold text-surface-invert typo-caption1"
      >
        Keep
      </button>
      <button
        type="button"
        className="h-6 rounded-8 px-2 text-text-tertiary typo-caption1"
      >
        Remove
      </button>
    </div>
  </div>
);

export const Ads: StoryObj = {
  name: '4. Ads & promotion',
  render: () => (
    <Page
      chapter="Widgets · 4"
      question="Where does the money live?"
      title="Six ways to keep the ad and promote ourselves"
      goal="Keep ad revenue and our own promotions in a hero the reader controls, without becoming the Windows widgets board."
      metric="Ad revenue per visit and hero engagement, side by side: neither may drop."
    >
      <Case
        title="1 · Reserved slot"
        note="Shown in edit mode: the Sponsored widget is pinned by daily.dev. It cannot be moved or removed, it never leaves the first screen, and Plus removes it."
      >
        <Stage columns={5}>
          <HomeScreen startEditing />
        </Stage>
      </Case>
      <Case
        title="2 · Sponsored version of a widget"
        note="No ad slot. A sponsor presents a widget the reader already chose, one sponsor per widget, labeled."
      >
        <Stage columns={5}>
          <SponsoredSkins />
        </Stage>
      </Case>
      <Case
        title="3 · A card in a stack"
        note="The ad joins the stack's rotation as one labeled card, never its default top card, with a frequency cap."
      >
        <Stage columns={5}>
          <HeroInFeed columns={COLUMNS}>
            <Shelf
              overflow="stack"
              columns={COLUMNS}
              widgets={[
                w('featured', 'l'),
                w('happening', 'm'),
                w('agents', 'm'),
                w('notifications', 'm'),
                w('ad', 'm', { sponsor: { name: 'Fastmail' } }),
                w('dms', 'm'),
              ]}
            />
          </HeroInFeed>
        </Stage>
      </Case>
      <Case
        title="4 · The masthead hour"
        note="YouTube's model: one advertiser owns the large slot for an hour, sold by share of voice. Rare, premium, and the rest of the row stays the reader's."
      >
        <Stage columns={5}>
          <HeroInFeed columns={COLUMNS}>
            <Shelf
              overflow="limit"
              columns={COLUMNS}
              widgets={[
                w('ad', 'l', {
                  isLocked: true,
                  sponsor: { name: 'Google Cloud' },
                }),
                w('happening', 'm'),
                w('agents', 'm'),
                w('streak', 's'),
                w('dms', 's'),
              ]}
            />
          </HeroInFeed>
        </Stage>
      </Case>
      <Case
        title="5 · Our features as suggestions"
        note="Briefing, the podcast or a squad arrive like iOS widget suggestions: Keep or Remove, capped, and never above the reader's own widgets."
      >
        <div className="flex h-[27.5rem] w-[17.25rem] flex-col">
          <Suggested />
        </div>
      </Case>
      <Case
        title="6 · Plus"
        note="No ad at all, and two extra spots as a Plus perk, the way Momentum sells extra widgets. The ad's slot becomes the reader's."
      >
        <Stage columns={5}>
          <HeroInFeed columns={COLUMNS}>
            <Shelf
              overflow="limit"
              columns={COLUMNS}
              widgets={[
                w('featured', 'l'),
                w('happening', 'm'),
                w('agents', 'm'),
                w('streak', 's'),
                w('bookmarks', 's'),
              ]}
            />
          </HeroInFeed>
        </Stage>
      </Case>
    </Page>
  ),
};

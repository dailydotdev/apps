import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import {
  FeedWidgetAddTile,
  getAddTileKinds,
} from '@dailydotdev/shared/src/features/feedWidgets/FeedWidgetAddTile';
import { FeedWidgetKind } from '@dailydotdev/shared/src/features/feedWidgets/types';
import { Case, Page, Stage } from './parts';
import { WidgetContent, WidgetSurface } from './widgets/catalog';
import { AdSlot, campaignStrips } from './widgets/adSlot';
import type { Edge, SquareLook, Surface } from './widgets/addTile';
import {
  addTileCss,
  finalists,
  roundThree,
  roundTwo,
  variations,
} from './widgets/addTile';

const meta: Meta = {
  title: 'Hero Cover/Final/6. Add a widget tile',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/*
 * Production shows a dashed "Add a widget" tile at the end of the rail
 * until the reader customizes it (feedWidgets/FeedWidgetRail.tsx). It is
 * the only thing on the default rail that asks for a click, and it says
 * nothing about what is behind it. These ten keep its place and its job
 * (open the gallery, or add straight away) and make it say what a widget
 * is, which ones there are, and, in the extension, that the new tab's
 * shortcuts belong in this slot rather than in a row of their own.
 */

const CELL_HEIGHT = '13.25rem';

/** The default rail at four columns: Top story, our ad slot, the tile. */
const RailStage = ({ children }: { children: ReactNode }): ReactElement => (
  <Stage columns={4}>
    <div
      className="grid gap-x-8 gap-y-4"
      style={{
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gridTemplateRows: `repeat(2, ${CELL_HEIGHT})`,
      }}
    >
      <WidgetSurface className="col-span-2 row-span-2" isBare>
        <WidgetContent kind="featured" size="l" />
      </WidgetSurface>
      <AdSlot strips={campaignStrips.slice(0, 1)} className="row-span-2" />
      <div className="row-span-2 flex min-h-0">{children}</div>
    </div>
  </Stage>
);

const Segmented = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}): ReactElement => (
  <div className="flex items-center rounded-max border border-border-subtlest-tertiary bg-background-default p-1 shadow-2">
    {options.map(([option, label]) => (
      <button
        key={option}
        type="button"
        aria-pressed={value === option}
        onClick={() => onChange(option)}
        className={classNames(
          'h-8 rounded-max px-4 font-bold typo-callout transition-colors',
          value === option
            ? 'bg-text-primary text-surface-invert'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {label}
      </button>
    ))}
  </div>
);

const Toggles = ({
  surface,
  edge,
  onSurface,
  onEdge,
  square,
  onSquare,
}: {
  surface: Surface;
  edge: Edge;
  onSurface: (surface: Surface) => void;
  onEdge: (edge: Edge) => void;
  square?: SquareLook;
  onSquare?: (square: SquareLook) => void;
}): ReactElement => (
  <div className="sticky top-4 z-2 flex flex-wrap items-center gap-3 self-start">
    <Segmented
      value={surface}
      options={[
        ['webapp', 'Webapp'],
        ['extension', 'Extension'],
      ]}
      onChange={onSurface}
    />
    <Segmented
      value={edge}
      options={[
        ['dashed', 'Dashed'],
        ['dotted', 'Dotted'],
      ]}
      onChange={onEdge}
    />
    {square && onSquare && (
      <Segmented
        value={square}
        options={[
          ['primary', 'Primary'],
          ['brand', 'Brand'],
          ['float', 'Float'],
        ]}
        onChange={onSquare}
      />
    )}
    <span className="text-text-tertiary typo-footnote">
      {surface === 'extension'
        ? 'New tab: every tile leads with Shortcuts.'
        : 'daily.dev in a tab: the usual suggestions first.'}
    </span>
  </div>
);

export const InTheRail: StoryObj = {
  name: '1. In the rail',
  render: function Render() {
    const [surface, setSurface] = useState<Surface>('webapp');
    const [edge, setEdge] = useState<Edge>('dashed');
    return (
      <Page
        chapter="Add a widget tile"
        question="What should the empty slot say before anyone touches it?"
        title="Ten ways to invite the first widget"
        goal="Keep the dashed empty slot on the default rail, but give it one explicit primary button that says what gets added, and above it a picture of what a widget is and which ones exist. In the extension the button adds the new tab’s shortcuts."
        metric="Gallery opens and first widgets added per default-rail impression, webapp and extension apart; in the extension, Shortcuts widgets added per new-tab reader and shortcuts used from the rail against the old row."
      >
        <style>{addTileCss}</style>
        <Toggles
          surface={surface}
          edge={edge}
          onSurface={setSurface}
          onEdge={setEdge}
        />
        <Case
          title="Today"
          note="Production’s tile: a dashed Tall slot with a plus and three words, shown while the rail is still the default and in edit mode. It is the only prompt on the rail and names nothing."
        >
          <RailStage>
            <button
              type="button"
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-16 border-2 border-dashed border-border-subtlest-secondary text-text-tertiary transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover hover:text-text-primary"
            >
              <PlusIcon size={IconSize.Large} />
              <span className="font-bold typo-callout">Add a widget</span>
            </button>
          </RailStage>
        </Case>
        {variations.map(({ id, name, note, Tile }) => (
          <Case key={id} title={name} note={note}>
            <RailStage>
              <Tile surface={surface} edge={edge} />
            </RailStage>
          </Case>
        ))}
        <Case
          title="Rules every variation keeps"
          note="The frame is production’s empty slot: a dashed (or dotted) edge, no fill, so it reads as a space and not a widget. One full-width primary button at the foot is the thing to click, and its label says what the click adds (“Add Streak”, “Add your shortcuts”, “Add a widget”); the picture above it only explains. The tile stays a Tall slot at the end of the default rail and goes away once the reader customizes. Motion is slow (a swap every two to three seconds, a turn a minute), pauses under the pointer and is off under reduced motion, since this tile sits in the feed on every load. Whatever it shows adds the real widget in the size the gallery would pick; the gallery itself does not change."
        >
          <div />
        </Case>
      </Page>
    );
  },
};

export const SideBySide: StoryObj = {
  name: '2. Side by side',
  render: function Render() {
    const [edge, setEdge] = useState<Edge>('dashed');
    return (
      <Page
        chapter="Add a widget tile"
        question="Which one stands out, next to the others?"
        title="All ten, both surfaces"
        goal="Compare the ten tiles at true size without the rail around them, the webapp row above the extension row."
        metric="A pick, or two to take further."
      >
        <style>{addTileCss}</style>
        <div className="sticky top-4 z-2 self-start">
          <Segmented
            value={edge}
            options={[
              ['dashed', 'Dashed'],
              ['dotted', 'Dotted'],
            ]}
            onChange={setEdge}
          />
        </div>
        {(['webapp', 'extension'] as Surface[]).map((surface) => (
          <Case
            key={surface}
            title={surface === 'webapp' ? 'Webapp' : 'Extension'}
            note={
              surface === 'webapp'
                ? 'The usual suggestions first: Happening Now, To-do list, Shortcuts, Streak.'
                : 'Shortcuts first, with the reader’s most visited sites.'
            }
          >
            <div className="flex flex-wrap gap-6">
              {variations.map(({ id, name, Tile }) => (
                <figure key={id} className="flex flex-col gap-2">
                  <figcaption className="text-text-tertiary typo-footnote">
                    {name}
                  </figcaption>
                  <div
                    className="flex"
                    style={{ width: '17.25rem', height: '27.5rem' }}
                  >
                    <Tile surface={surface} edge={edge} />
                  </div>
                </figure>
              ))}
            </div>
          </Case>
        ))}
      </Page>
    );
  },
};

export const RoundTwo: StoryObj = {
  name: '3. Round two: today + cards',
  render: function Render() {
    const [surface, setSurface] = useState<Surface>('webapp');
    const [edge, setEdge] = useState<Edge>('dashed');
    return (
      <Page
        chapter="Add a widget tile"
        question="Can today’s tile stay this simple and still show the widgets?"
        title="Today’s center, the cards around it"
        goal="Keep today’s bones (the dashed slot, the plus and the label in the middle, now with the primary button under them) and lay the hand of cards from variation 2 around the center as the background, fanned, spread, on a ring, stacked or peeking in."
        metric="Same as round one: gallery opens and first widgets added per default-rail impression; in the extension, Shortcuts widgets added per new-tab reader."
      >
        <style>{addTileCss}</style>
        <Toggles
          surface={surface}
          edge={edge}
          onSurface={setSurface}
          onEdge={setEdge}
        />
        {roundTwo.map(({ id, name, note, Tile }) => (
          <Case key={id} title={name} note={note}>
            <RailStage>
              <Tile surface={surface} edge={edge} />
            </RailStage>
          </Case>
        ))}
        <Case title="The five side by side">
          <div className="flex flex-wrap gap-6">
            {roundTwo.map(({ id, name, Tile }) => (
              <figure key={id} className="flex flex-col gap-2">
                <figcaption className="text-text-tertiary typo-footnote">
                  {name}
                </figcaption>
                <div
                  className="flex"
                  style={{ width: '17.25rem', height: '27.5rem' }}
                >
                  <Tile surface={surface} edge={edge} />
                </div>
              </figure>
            ))}
          </div>
        </Case>
      </Page>
    );
  },
};

export const RoundThree: StoryObj = {
  name: '4. Round three: square plus, cards below',
  render: function Render() {
    const [surface, setSurface] = useState<Surface>('webapp');
    const [edge, setEdge] = useState<Edge>('dashed');
    const [square, setSquare] = useState<SquareLook>('primary');
    return (
      <Page
        chapter="Add a widget tile"
        question="Can the plus be the only button?"
        title="The square is the button, the widgets lie below"
        goal="One control: the plus as a rounded square in a primary style, with “Add a widget” and the names of what is behind it (Happening Now, To-do list, Shortcuts, Streak) under it. The whole slot clicks through to it. Below the words, the widgets lie in five kinds of stack. Weather is out: it is not launching."
        metric="Gallery opens and first widgets added per default-rail impression; in the extension, Shortcuts widgets added per new-tab reader."
      >
        <style>{addTileCss}</style>
        <Toggles
          surface={surface}
          edge={edge}
          onSurface={setSurface}
          onEdge={setEdge}
          square={square}
          onSquare={setSquare}
        />
        <Case
          title="The five side by side"
          note="Primary is our primary button’s paint, Brand is cabbage, Float is today’s quiet plus that turns primary on hover. The square scales up a touch on hover and presses down on click."
        >
          <div className="flex flex-wrap gap-6">
            {roundThree.map(({ id, name, Tile }) => (
              <figure key={id} className="flex flex-col gap-2">
                <figcaption className="text-text-tertiary typo-footnote">
                  {name}
                </figcaption>
                <div
                  className="flex"
                  style={{ width: '17.25rem', height: '27.5rem' }}
                >
                  <Tile surface={surface} edge={edge} square={square} />
                </div>
              </figure>
            ))}
          </div>
        </Case>
        {roundThree.map(({ id, name, note, Tile }) => (
          <Case key={id} title={name} note={note}>
            <RailStage>
              <Tile surface={surface} edge={edge} square={square} />
            </RailStage>
          </Case>
        ))}
      </Page>
    );
  },
};

export const Finalists: StoryObj = {
  name: '5. Finalists: 16 and 18',
  render: function Render() {
    const [surface, setSurface] = useState<Surface>('webapp');
    const [edge, setEdge] = useState<Edge>('dashed');
    const [square, setSquare] = useState<SquareLook>('primary');
    return (
      <Page
        chapter="Add a widget tile"
        question="Fan or Wallet?"
        title="The two finalists"
        goal="Round three’s two picks with the square moved down toward the middle of the slot and the cards close under the words, running off the floor, so the button sits center stage and the widgets read as what it opens."
        metric="Gallery opens and first widgets added per default-rail impression; in the extension, Shortcuts widgets added per new-tab reader."
      >
        <style>{addTileCss}</style>
        <Toggles
          surface={surface}
          edge={edge}
          onSurface={setSurface}
          onEdge={setEdge}
          square={square}
          onSquare={setSquare}
        />
        <Case title="Side by side, both surfaces">
          <div className="flex flex-wrap gap-6">
            {(['webapp', 'extension'] as Surface[]).flatMap((each) =>
              finalists.map(({ id, name, Tile }) => (
                <figure key={`${each}-${id}`} className="flex flex-col gap-2">
                  <figcaption className="text-text-tertiary typo-footnote">
                    {name} · {each === 'webapp' ? 'Webapp' : 'Extension'}
                  </figcaption>
                  <div
                    className="flex"
                    style={{ width: '17.25rem', height: '27.5rem' }}
                  >
                    <Tile surface={each} edge={edge} square={square} />
                  </div>
                </figure>
              )),
            )}
          </div>
        </Case>
        {finalists.map(({ id, name, note, Tile }) => (
          <Case key={id} title={name} note={note}>
            <RailStage>
              <Tile surface={surface} edge={edge} square={square} />
            </RailStage>
          </Case>
        ))}
      </Page>
    );
  },
};

const noop = (): void => undefined;

export const InProduction: StoryObj = {
  name: '6. In production',
  render: function Render() {
    const states: {
      title: string;
      note: string;
      isExtension: boolean;
      isLoggedIn: boolean;
    }[] = [
      {
        title: 'Webapp, signed in',
        note: 'Happening Now, To-do list, Shortcuts and Streak, Happening Now open in front.',
        isExtension: false,
        isLoggedIn: true,
      },
      {
        title: 'Extension, signed in',
        note: 'Shortcuts leads and is the open file, then Happening Now, To-do list and Streak: the new tab’s shortcuts belong on the rail.',
        isExtension: true,
        isLoggedIn: true,
      },
      {
        title: 'Signed out',
        note: 'Only widgets a guest can add: Happening Now and Shortcuts.',
        isExtension: false,
        isLoggedIn: false,
      },
    ];
    return (
      <Page
        chapter="Add a widget tile"
        question="What ships?"
        title="The tile in production"
        goal="Production’s FeedWidgetAddTile (feedWidgets/FeedWidgetAddTile.tsx), the Wallet finalist built on the registry: each file is a real widget kind with its own icon, tint and name, picked by getAddTileKinds, never one already on the rail or one the reader cannot add. The whole tile opens the gallery, as the dashed tile did."
        metric="Gallery opens from the tile per default-rail impression (OpenFeedWidgetGallery, source tile), and first widgets added; in the extension, Shortcuts widgets added."
      >
        {states.map(({ title, note, isExtension, isLoggedIn }) => (
          <Case key={title} title={title} note={note}>
            <RailStage>
              <FeedWidgetAddTile
                kinds={getAddTileKinds({
                  onRail: [FeedWidgetKind.TopStory],
                  isLoggedIn,
                  isExtension,
                })}
                onClick={noop}
                style={{ flex: 1 }}
              />
            </RailStage>
          </Case>
        ))}
      </Page>
    );
  },
};

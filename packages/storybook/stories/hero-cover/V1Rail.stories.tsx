import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { Case, Page, Stage } from './parts';
import { AdSlot, campaignStrips } from './widgets/adSlot';
import type { RailWidget } from './widgets/rail';
import { rw, WidgetRail } from './widgets/rail';
import { WidgetContent, WidgetSurface } from './widgets/catalog';
import { isCardWidget } from './widgets/production';

const meta: Meta = {
  title: 'Hero Cover/Final/2. Rail behavior',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const defaultRail = (): RailWidget[] => [
  rw('featured', 'l'),
  rw('happening', 'm'),
  rw('weather', 's'),
  rw('todo', 's'),
  rw('digest', 'm'),
  rw('introquests', 's'),
  rw('shortcuts', 's'),
  rw('streak', 's'),
  rw('notifications', 's'),
  rw('briefing', 'm'),
  rw('weather', 's'),
  rw('bookmarks', 's'),
  rw('squads', 'm'),
];

const decisions: [string, string][] = [
  [
    'V1',
    'The rail: one horizontal row of widgets above the feed. Ships first.',
  ],
  ['V2', 'The home screen with stacks (Finals A), as the next step.'],
  [
    'Ours',
    'The ad slot is locked to the rail’s third column, as production lays it out: second after a Large first widget, third after two Talls. It carries the ad and up to two campaign strips.',
  ],
  [
    'Yours',
    'Everything else: add, remove, reorder, resize. The first slot too, so the top story can grow or shrink.',
  ],
  [
    'Sizes',
    'Three: Small (a square), Tall, and Large (a big square). No wide size.',
  ],
  [
    'Phone',
    'The same rail, one card and the edge of the next, swiped sideways. The ad slot leaves the rail and the ad returns to the feed, second, after the first post.',
  ],
  [
    'Layout',
    'Where the rail sits on the page, its header (greeting, actions, Customize) and the feed’s tabs under it, at every breakpoint: 1. Home layout.',
  ],
];

const behavior: [string, string, string][] = [
  [
    'Edit',
    'Customize enters edit mode; Done, Esc or a click outside leaves it. Controls fade in over 180ms and the layout never moves.',
    'Apple, Windows 11',
  ],
  [
    'Menu',
    'In edit mode every widget has a menu: size, move to start, left, right, end, and remove, so reordering never requires a drag. Outside edit mode widgets carry no controls; Customize is the one way in.',
    'WCAG 2.5.7, Atlassian',
  ],
  [
    'Resize',
    'Drag any corner but the remove one, as on iOS and macOS. An outline follows the pointer; the widget snaps to Small, Tall or Large once the outline passes halfway into the next cell, only to sizes it supports, and neighbours reflow in 180ms. The menu offers the same sizes without a drag.',
    'Windows 11, react-grid-layout',
  ],
  [
    'Drag',
    'Lifts after 4px of movement (a 250ms hold on touch): scale 1.03, a deeper shadow, no rotation. A placeholder keeps the widget’s footprint.',
    'react-grid-layout, Atlassian, dnd-kit',
  ],
  [
    'Swap',
    'Neighbours move when the dragged widget’s center crosses them, not the cursor, so a grab near an edge does not twitch the row.',
    'NN/g',
  ],
  [
    'Edges',
    'The rail scrolls on its own near either end while dragging, faster the closer and the longer you hold it there. Snapping pauses until the drop.',
    'Atlassian auto-scroll',
  ],
  [
    'Drop',
    'Settles into place in 200ms, then flashes for 700ms. Escape mid-drag puts it back.',
    'Atlassian',
  ],
  [
    'Keyboard',
    'Space lifts, arrows move one slot, Space drops, Escape cancels. Each step is announced with its position; the sponsored slot is skipped and said so.',
    'dnd-kit, Atlassian',
  ],
  [
    'Remove',
    'Instant, no dialog. Undo for 6 seconds; focus moves to the next widget.',
    'macOS, Atlassian',
  ],
  [
    'Add',
    'The dashed tile opens the gallery; widgets already on the rail say Added. The new one lands at the end, scrolls into view and flashes.',
    'iOS, Windows 11',
  ],
  [
    'Scroll',
    'Native: trackpad and shift-wheel untouched, the vertical wheel never hijacked. Arrows on hover scroll 85%; edges fade only where there is more.',
    'Chrome carousels, eBay',
  ],
  [
    'Ours',
    'The ad slot is static: no handle, no menu, not a drop target, always second.',
    'react-grid-layout static',
  ],
  [
    'Motion',
    'Reduced motion drops the jiggle, lift, flash and reflow; everything still works.',
    'WCAG',
  ],
];

const AnatomyCell = ({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <span className="text-text-tertiary typo-footnote">{title}</span>
    <div className="flex h-[27.5rem] w-[17.25rem]">{children}</div>
  </div>
);

export const V1Rail: StoryObj = {
  name: '2. Rail behavior',
  render: () => (
    <Page
      chapter="Final · 2"
      question="How does the rail behave?"
      title="Rail behavior"
      goal="The rail's rules: one horizontal row of widgets the reader owns on the feed's columns, how editing, dragging, resizing and adding work, the locked ad slot, and the three sizes. The page around it is 1. Home layout."
      metric="Hero clicks per visit and share of readers who customize, with ad revenue per visit held flat against today's hero."
    >
      <Case title="What we agreed with Ido">
        <dl className="grid max-w-[64rem] grid-cols-[auto_1fr] gap-x-6 gap-y-2 typo-callout">
          {decisions.map(([term, text]) => (
            <React.Fragment key={term}>
              <dt className="font-bold text-text-primary">{term}</dt>
              <dd className="text-text-secondary">{text}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Case>

      <Case
        title="Customizing"
        note="Edit mode, entered from Customize in the rail’s header: widgets jiggle, the ad slot dims and says it is ours, and the add tile closes the rail."
      >
        <Stage columns={5}>
          <WidgetRail
            initialWidgets={defaultRail()}
            strips={campaignStrips.slice(0, 1)}
            startEditing
          />
        </Stage>
      </Case>

      <Case
        title="How it behaves"
        note="The rules the rail follows, from research into Apple, Windows, Atlassian, dnd-kit, react-grid-layout, NN/g and WCAG 2.2. Everything here works in the rail above and on 1. Home layout."
      >
        <dl className="grid max-w-[80rem] grid-cols-[auto_1fr_auto] gap-x-6 gap-y-3 typo-callout">
          {behavior.map(([term, text, source]) => (
            <React.Fragment key={term}>
              <dt className="font-bold text-text-primary">{term}</dt>
              <dd className="text-text-secondary">{text}</dd>
              <dd className="text-right text-text-quaternary typo-caption1">
                {source}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      </Case>
      <Case
        title="The ad slot"
        note="One Tall column, pinned to the third column, never movable. Each campaign decides the strips above the ad: none, one or two, ours or paid. Plus readers keep the strips and lose the ad."
      >
        <div className="flex flex-wrap gap-8">
          <AnatomyCell title="Ad only">
            <AdSlot className="flex-1" />
          </AnatomyCell>
          <AnatomyCell title="One strip">
            <AdSlot className="flex-1" strips={campaignStrips.slice(0, 1)} />
          </AnatomyCell>
          <AnatomyCell title="Two strips">
            <AdSlot className="flex-1" strips={campaignStrips.slice(0, 2)} />
          </AnatomyCell>
          <AnatomyCell title="Paid strip">
            <AdSlot className="flex-1" strips={campaignStrips.slice(3, 4)} />
          </AnatomyCell>
          <AnatomyCell title="Plus: strips, no ad">
            <AdSlot
              className="flex-1"
              strips={campaignStrips.slice(0, 1)}
              isPlus
            />
          </AnatomyCell>
        </div>
      </Case>

      <Case
        title="Three sizes"
        note="Small is a square, Tall is one column the hero's full height, Large is a big square across two columns."
      >
        <div className="flex flex-wrap items-end gap-8">
          {(
            [
              ['s', 'Small', '17.25rem', '13.25rem'],
              ['m', 'Tall', '17.25rem', '27.5rem'],
              ['l', 'Large', '36.5rem', '27.5rem'],
            ] as const
          ).map(([size, label, width, height]) => (
            <div key={size} className="flex flex-col gap-2">
              <span className="text-text-tertiary typo-footnote">{label}</span>
              <div className="flex" style={{ width, height }}>
                <WidgetSurface
                  className="flex-1"
                  isBare={isCardWidget('featured', size)}
                >
                  <WidgetContent kind="featured" size={size} />
                </WidgetSurface>
              </div>
            </div>
          ))}
        </div>
      </Case>
    </Page>
  ),
};

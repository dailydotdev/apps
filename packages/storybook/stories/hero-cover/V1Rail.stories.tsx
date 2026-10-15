import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import { adWithoutCta, cardHandlers } from '../features/feed/feedHero.mocks';
import { Case, Page, Stage } from './parts';
import { realPosts } from './realData';
import { HeroInFeed } from './widgets/frame';
import { AdSlot, campaignStrips } from './widgets/adSlot';
import type { RailWidget } from './widgets/rail';
import { rw, WidgetRail } from './widgets/rail';
import { WidgetContent, WidgetSurface } from './widgets/catalog';

const meta: Meta = {
  title: 'Hero Cover/V1 Rail',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const defaultRail = (): RailWidget[] => [
  rw('featured', 'l'),
  rw('happening', 'm'),
  rw('agents', 'm'),
  rw('streak', 's'),
  rw('notifications', 's'),
  rw('mybrief', 'm'),
  rw('podcast', 's'),
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
    'The ad slot is locked and always the second widget. It carries the ad and up to two campaign strips.',
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
    'The same rail, swiped sideways. The ad slot leaves the rail and the ad returns to the feed, second, after the first post.',
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
    'Every widget has a menu, in and out of edit mode: size, move to start, left, right, end, and remove. Reordering never requires a drag.',
    'WCAG 2.5.7, Atlassian',
  ],
  [
    'Resize',
    'Small, Tall or Large from the menu or the picker on the widget, only the sizes it supports. Neighbours reflow in 180ms.',
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

/** A 375pt phone: the rail, the tabs, then the feed with the ad second. */
const PhoneWithFeed = (): ReactElement => (
  <div className="flex w-[23.4375rem] shrink-0 flex-col gap-4 overflow-hidden rounded-32 border-4 border-border-subtlest-tertiary bg-background-default px-4 pb-4 pt-6">
    <WidgetRail
      initialWidgets={[rw('featured', 'm'), ...defaultRail().slice(1)]}
      isPhone
      showAdSlot={false}
      cellHeight="11.25rem"
    />
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {['For you', 'AI', 'React', 'TypeScript', 'DevOps'].map((chip, index) => (
        <span
          key={chip}
          className={classNames(
            'flex h-8 shrink-0 items-center rounded-10 px-3 font-bold typo-footnote',
            index === 0
              ? 'bg-surface-float text-text-primary'
              : 'text-text-tertiary',
          )}
        >
          {chip}
        </span>
      ))}
    </div>
    <ArticleGrid post={realPosts[12]} {...cardHandlers} />
    <div className="relative">
      <span className="absolute -left-1 -top-3 z-1 rounded-6 bg-accent-water-flat px-1.5 font-bold text-accent-water-default typo-caption2">
        Ad, second in the feed
      </span>
      <AdGrid ad={adWithoutCta} index={1} feedIndex={1} />
    </div>
    <ArticleGrid post={realPosts[13]} {...cardHandlers} />
  </div>
);

export const V1Rail: StoryObj = {
  name: 'V1 Rail',
  render: () => (
    <Page
      chapter="V1"
      question="What do we ship first?"
      title="The widget rail"
      goal="Ship the hero as one horizontal row of widgets the reader owns, with our ad slot locked second, on the feed's columns on desktop and the same rail swiped on phones."
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
        title="On the feed"
        note="Scroll sideways with a trackpad, shift and the wheel, or the arrows. Press Customize to edit: drag to reorder, pick a size, the minus removes (with undo), the dashed tile at the end adds. Escape finishes."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <WidgetRail
              initialWidgets={defaultRail()}
              strips={campaignStrips.slice(0, 2)}
            />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="Customizing"
        note="Edit mode: widgets jiggle, the ad slot dims and says it is ours, and the add tile closes the rail."
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
        note="The rules the rail follows, from research into Apple, Windows, Atlassian, dnd-kit, react-grid-layout, NN/g and WCAG 2.2. Everything here works in the rails above."
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
        note="One Tall column, always second, never movable. Each campaign decides the strips above the ad: none, one or two, ours or paid. Plus readers keep the strips and lose the ad."
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
                <WidgetSurface className="flex-1">
                  <WidgetContent kind="featured" size={size} />
                </WidgetSurface>
              </div>
            </div>
          ))}
        </div>
      </Case>

      <Case
        title="On a phone"
        note="The same rail: one column and the edge of the next, swiped sideways while the page still scrolls up and down. The top story starts Tall on a phone. Below the small-screen breakpoint the ad slot leaves the rail and the ad goes back to the feed, second, after the first post, as it is today."
      >
        <PhoneWithFeed />
      </Case>
    </Page>
  ),
};

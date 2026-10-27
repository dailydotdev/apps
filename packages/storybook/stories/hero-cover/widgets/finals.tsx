import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { cardHandlers } from '../../features/feed/feedHero.mocks';
import { realPosts } from '../realData';
import type { ShelfWidget } from './shelf';
import { Shelf } from './shelf';
import type { StackIndicatorStyle } from './stack';
import { CustomizeButton, HeroInFeed } from './frame';
import { COLUMNS, w } from './directions';
import {
  Actions,
  AroundYou,
  BriefLabel,
  briefing,
  SourceChip,
} from './briefing';

/* ------------------------------------------------------------------ */
/* Phone frame                                                         */
/* ------------------------------------------------------------------ */

/** A 375pt phone: the hero, the feed's tabs, and the first cards under it. */
export const PhoneFrame = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-[23.4375rem] shrink-0 flex-col gap-4 overflow-hidden rounded-32 border-4 border-border-subtlest-tertiary bg-background-default px-4 pb-4 pt-6">
    {children}
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
  </div>
);

const PhoneToolbar = ({
  isEditing,
  onToggle,
  left,
}: {
  isEditing: boolean;
  onToggle: () => void;
  left?: ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2">
    <div className="min-w-0 flex-1">{left}</div>
    <CustomizeButton isEditing={isEditing} onClick={onToggle} />
  </div>
);

const PHONE_CELL = '9.5rem';

/* ------------------------------------------------------------------ */
/* Stack indicator                                                     */
/* ------------------------------------------------------------------ */

const gestures: [string, string][] = [
  [
    'Scroll',
    'A mouse wheel or a trackpad over the widget flips one per gesture.',
  ],
  ['Swipe', 'Up or down with a finger on touch screens.'],
  ['Keys', 'Arrow up and down once it has focus.'],
  ['Dots', 'Wake on hover and after a flip, then fade. Still clickable.'],
];

/** The stack the finals use: Apple's Smart Stack, polished for a pointer. */
export const StackDemo = (): ReactElement => (
  <div className="flex flex-wrap items-start gap-10">
    <div className="w-[17.25rem]">
      <Shelf
        columns={1}
        overflow="limit"
        widgets={[w('happening', 'm', { stack: ['agents', 'notifications'] })]}
      />
    </div>
    <div className="w-[17.25rem]">
      <Shelf
        columns={1}
        overflow="limit"
        widgets={[
          w('streak', 's', { stack: ['dms', 'bookmarks'] }),
          w('podcast', 's', { stack: ['briefing'] }),
        ]}
      />
    </div>
    <dl className="flex max-w-[28rem] flex-col gap-3 pt-2">
      {gestures.map(([term, text]) => (
        <div key={term} className="flex gap-3 typo-callout">
          <dt className="w-14 shrink-0 font-bold text-text-primary">{term}</dt>
          <dd className="text-text-secondary">{text}</dd>
        </div>
      ))}
      <p className="pt-2 text-text-tertiary typo-footnote">
        At either end of a stack the scroll goes back to the page, so a stack
        never traps the reader.
      </p>
    </dl>
  </div>
);

/* ------------------------------------------------------------------ */
/* A · Home Screen                                                     */
/* ------------------------------------------------------------------ */

export const FinalHomeScreen = ({
  stackIndicator = 'smart',
}: {
  stackIndicator?: StackIndicatorStyle;
}): ReactElement => {
  const [widgets, setWidgets] = useState<ShelfWidget[]>(() => [
    w('featured', 'l', { stack: ['mybrief'] }),
    w('happening', 'm', { stack: ['agents', 'trending'] }),
    w('notifications', 's', { stack: ['dms'] }),
    w('streak', 's'),
    w('ad', 'm', { isLocked: true }),
    w('bookmarks', 'm'),
    w('digest', 'w'),
    w('podcast', 's'),
  ]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <HeroInFeed columns={COLUMNS}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <CustomizeButton
            isEditing={isEditing}
            onClick={() => setIsEditing((value) => !value)}
          />
        </div>
        <Shelf
          widgets={widgets}
          columns={COLUMNS}
          overflow="pages"
          isEditing={isEditing}
          stackIndicator={stackIndicator}
          onChange={setWidgets}
        />
      </div>
    </HeroInFeed>
  );
};

export const PhoneHomeScreen = (): ReactElement => {
  const [widgets, setWidgets] = useState<ShelfWidget[]>(() => [
    w('featured', 'w'),
    w('happening', 'm', { stack: ['agents'] }),
    w('notifications', 's', { stack: ['dms'] }),
    w('streak', 's'),
    w('ad', 'm', { isLocked: true }),
    w('bookmarks', 's'),
    w('podcast', 's'),
  ]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <PhoneFrame>
      <PhoneToolbar
        isEditing={isEditing}
        onToggle={() => setIsEditing((value) => !value)}
      />
      <Shelf
        widgets={widgets}
        columns={2}
        overflow="pages"
        cellHeight={PHONE_CELL}
        isEditing={isEditing}
        onChange={setWidgets}
      />
    </PhoneFrame>
  );
};

/* ------------------------------------------------------------------ */
/* C · Ours + Yours                                                    */
/* ------------------------------------------------------------------ */

export const PhoneOursAndYours = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <PhoneFrame>
      <PhoneToolbar
        isEditing={isEditing}
        onToggle={() => setIsEditing((value) => !value)}
        left={
          isEditing && (
            <span className="text-text-tertiary typo-caption1">
              The top story is ours. The row under it is yours: 2 of 2 used. On
              phones the ad stays in the feed.
            </span>
          )
        }
      />
      <Shelf
        columns={2}
        overflow="limit"
        cellHeight={PHONE_CELL}
        isEditing={isEditing}
        widgets={[
          w('featured', 'w', { isLocked: true }),
          w('notifications', 's'),
          w('streak', 's'),
        ]}
      />
    </PhoneFrame>
  );
};

/* ------------------------------------------------------------------ */
/* D · Rail                                                            */
/* ------------------------------------------------------------------ */

export const PhoneRail = (): ReactElement => (
  <PhoneFrame>
    <span className="text-text-quaternary typo-caption1">Swipe for more →</span>
    <Shelf
      columns={2}
      overflow="scroll"
      cellHeight={PHONE_CELL}
      widgets={[
        w('featured', 'l'),
        w('happening', 'm'),
        w('ad', 'm', { isLocked: true }),
        w('agents', 'm'),
        w('streak', 's'),
        w('podcast', 's'),
      ]}
    />
  </PhoneFrame>
);

/* ------------------------------------------------------------------ */
/* G · Adaptive                                                        */
/* ------------------------------------------------------------------ */

const phoneMoments: { name: string; reason: string; widgets: ShelfWidget[] }[] =
  [
    {
      name: 'Morning',
      reason: 'You read your brief before 10',
      widgets: [
        w('briefing', 'w'),
        w('happening', 'm', { isLocked: true }),
        w('streak', 's'),
        w('notifications', 's'),
      ],
    },
    {
      name: 'Afternoon',
      reason: 'Agents ship in the afternoon',
      widgets: [
        w('featured', 'w'),
        w('happening', 'm', { isLocked: true }),
        w('agents', 'm'),
      ],
    },
    {
      name: 'Evening',
      reason: 'You listen on the way home',
      widgets: [
        w('podcast', 'w'),
        w('happening', 'm', { isLocked: true }),
        w('continue', 's'),
        w('dms', 's'),
      ],
    },
  ];

export const PhoneAdaptive = (): ReactElement => {
  const [active, setActive] = useState(0);
  const moment = phoneMoments[active];

  return (
    <PhoneFrame>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 self-start rounded-10 bg-surface-float p-1">
          {phoneMoments.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActive(index)}
              className={classNames(
                'h-7 rounded-8 px-3 typo-caption1',
                index === active
                  ? 'bg-text-primary font-bold text-surface-invert'
                  : 'text-text-tertiary',
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
        <span className="text-text-tertiary typo-caption1">
          ✦ Arranged for you · {moment.reason}
        </span>
      </div>
      <Shelf
        key={active}
        columns={2}
        overflow="limit"
        cellHeight={PHONE_CELL}
        widgets={moment.widgets}
      />
    </PhoneFrame>
  );
};

/* ------------------------------------------------------------------ */
/* H1 · Briefing front page                                            */
/* ------------------------------------------------------------------ */

/** The front page on a phone: one column, three lines, the people folded in. */
export const PhoneBriefing = (): ReactElement => (
  <PhoneFrame>
    <section className="flex flex-col gap-4 rounded-16 bg-background-subtle p-4">
      <BriefLabel compact>{briefing.window}</BriefLabel>
      <h2 className="font-bold text-text-primary typo-title2">
        {briefing.headline}
      </h2>
      <ul className="flex flex-col gap-3">
        {briefing.stack.slice(0, 3).map((line) => (
          <li key={line.text} className="flex flex-col gap-1">
            <span className="text-text-quaternary typo-caption1">
              {line.why}
            </span>
            <span className="text-text-primary typo-callout">
              {line.text}{' '}
              {line.sources.slice(0, 1).map((post) => (
                <SourceChip key={post.id} post={post} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border-subtlest-tertiary pt-4">
        <AroundYou limit={2} />
      </div>
      <Actions />
    </section>
  </PhoneFrame>
);

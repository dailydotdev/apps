import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Case, Page, Stage } from './parts';
import { HeroInFeed } from './widgets/frame';
import { campaignStrips } from './widgets/adSlot';
import type { RailWidget } from './widgets/rail';
import { rw, WidgetRail } from './widgets/rail';

const meta: Meta = {
  title: 'Hero Cover/Customize',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const rail = (): RailWidget[] => [
  rw('featured', 'l'),
  rw('happening', 'm'),
  rw('agents', 'm'),
  rw('streak', 's'),
  rw('notifications', 's'),
  rw('mybrief', 'm'),
];

const strips = campaignStrips.slice(0, 1);

const editHint = 'Drag to reorder, drag a corner to resize';

/** Controls that live outside the rail say so, or clicking them ends editing. */
const Overlay = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div data-rail-overlay className={className} style={{ zIndex: 5 }}>
    {children}
  </div>
);

const DoneButton = ({ onClick }: { onClick: () => void }): ReactElement => (
  <Button
    variant={ButtonVariant.Primary}
    size={ButtonSize.Small}
    onClick={onClick}
  >
    Done
  </Button>
);

/* ------------------------------------------------------------------ */
/* 1. A toolbar that appears on the hero                               */
/* ------------------------------------------------------------------ */

/**
 * A glass pill rides the hero's top edge when the pointer is over it, like
 * the hover toolbar on a Figma frame or a Notion block. Zero height at
 * rest, impossible to miss once you reach for the hero, and it stays as the
 * edit bar (instructions and Done) while editing.
 */
const ToolbarVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="group/hero relative">
      <Overlay
        className={classNames(
          'absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-max border border-border-subtlest-tertiary bg-background-default p-1 shadow-3 transition-opacity duration-150',
          isEditing
            ? 'opacity-100'
            : 'opacity-0 focus-within:opacity-100 group-hover/hero:opacity-100',
        )}
      >
        {isEditing ? (
          <>
            <span className="px-3 text-text-tertiary typo-footnote">
              {editHint}
            </span>
            <DoneButton onClick={() => setIsEditing(false)} />
          </>
        ) : (
          <>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Customize
            </Button>
            <span className="h-4 w-px bg-border-subtlest-tertiary" />
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={() => setIsEditing(true)}
            >
              Add widget
            </Button>
          </>
        )}
      </Overlay>
      <WidgetRail
        initialWidgets={rail()}
        strips={strips}
        header="none"
        isEditing={isEditing}
        onEditingChange={setIsEditing}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 2. In the feed's own tab row                                         */
/* ------------------------------------------------------------------ */

/**
 * The feed already has a row of controls under the hero: its tabs. Customize
 * joins them at the end, where people already look to shape what they see.
 * No new row, always visible, and it reads as one more way to tune the feed.
 */
const FeedRowVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <HeroInFeed
      columns={5}
      chipsTrailing={
        <Overlay className="flex shrink-0 items-center gap-3">
          {isEditing && (
            <span className="text-text-tertiary typo-footnote">{editHint}</span>
          )}
          {isEditing ? (
            <DoneButton onClick={() => setIsEditing(false)} />
          ) : (
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Customize hero
            </Button>
          )}
        </Overlay>
      }
    >
      <WidgetRail
        initialWidgets={rail()}
        strips={strips}
        header="none"
        isEditing={isEditing}
        onEditingChange={setIsEditing}
      />
    </HeroInFeed>
  );
};

/* ------------------------------------------------------------------ */
/* 3. From the widget itself                                            */
/* ------------------------------------------------------------------ */

/**
 * Hovering a widget shows a pencil on its corner, where the remove button
 * will sit once editing, like the "…" on a Windows 11 widget. Editing
 * starts from the thing you want to change, and the affordance teaches
 * where the edit controls will appear.
 */
const WidgetPencilVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="relative">
      {isEditing && (
        <Overlay className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-max border border-border-subtlest-tertiary bg-background-default p-1 shadow-3">
          <span className="px-3 text-text-tertiary typo-footnote">
            {editHint}
          </span>
          <DoneButton onClick={() => setIsEditing(false)} />
        </Overlay>
      )}
      <WidgetRail
        initialWidgets={rail()}
        strips={strips}
        header="none"
        hasHoverEdit
        isEditing={isEditing}
        onEditingChange={setIsEditing}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 4. A greeting that anchors the control                               */
/* ------------------------------------------------------------------ */

const hour = new Date().getHours();
const greeting = {
  title: `${
    (hour < 12 && 'Good morning') ||
    (hour < 18 && 'Good afternoon') ||
    'Good evening'
  }, Tsahi`,
  subtitle: '12 new since yesterday',
};

/* ------------------------------------------------------------------ */
/* 5. Taught once, then quiet                                           */
/* ------------------------------------------------------------------ */

/**
 * The first visit after launch says what changed and offers the action in
 * the same breath; once used or dismissed, the hero keeps only the quiet
 * controls row. Discovery is solved where it matters, and the hero pays
 * the extra height once, not every day.
 */
const InvitationVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTaught, setIsTaught] = useState(false);
  const begin = () => {
    setIsTaught(true);
    setIsEditing(true);
  };
  return (
    <div className="flex flex-col gap-3">
      {!isTaught && (
        <Overlay className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle py-3 pl-4 pr-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-accent-cabbage-flat text-accent-cabbage-default">
            <EditIcon size={IconSize.Small} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-callout">
              This space is yours now
            </span>
            <span className="text-text-tertiary typo-footnote">
              Add the widgets you check every day, drop the ones you don’t, and
              make any of them bigger.
            </span>
          </div>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={begin}
          >
            Customize
          </Button>
          <CloseButton
            size={ButtonSize.Small}
            onClick={() => setIsTaught(true)}
          />
        </Overlay>
      )}
      <WidgetRail
        initialWidgets={rail()}
        strips={strips}
        header={isTaught ? 'controls' : 'none'}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
      />
    </div>
  );
};

export const Customize: StoryObj = {
  name: 'Customize',
  render: () => (
    <Page
      chapter="Customize"
      question="How does a reader find out the hero is theirs to change?"
      title="Five ways into customizing"
      goal="Make customizing explicit on desktop, without a hidden gesture and without a heavy permanent control on the hero."
      metric="Share of hero viewers who open edit mode in their first week, and how many keep a changed rail, against hero height above the fold."
    >
      <Case
        title="Recommendation: 4 for every day, with 5 on launch"
        note="A greeting row gives Customize a permanent, explicit home that reads as part of the hero rather than a tool floating over it. For the launch, the invitation does the teaching once and then gets out of the way. 1 is the best zero-height option if the greeting row is not wanted; 2 and 3 are worth testing but have real costs, noted on each."
      >
        <span />
      </Case>

      <Case
        title="1. A toolbar that appears on the hero"
        note="Hover the hero: a pill with Customize and Add widget rides its top edge, and becomes the edit bar with Done. Zero height at rest. Cost: invisible until the pointer reaches the hero, so it relies on curiosity."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <ToolbarVariant />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="2. In the feed’s own tab row"
        note="Customize hero sits at the end of the feed’s tabs, where people already go to shape what they see. Always visible, no new row. Cost: it sits below the hero it changes, so the link between button and rail is weaker."
      >
        <Stage columns={5}>
          <FeedRowVariant />
        </Stage>
      </Case>

      <Case
        title="3. From the widget itself"
        note="Hover any widget: a pencil appears on its corner, exactly where the remove button sits once editing. Editing starts from the widget you meant to change. Cost: per-widget, so a reader who wants to add something new has nothing to hover yet."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <WidgetPencilVariant />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="4. A greeting that anchors the control"
        note="“Good afternoon, Tsahi” turns the controls row into a header, with Customize beside it like Edit beside a list on iOS. Always visible and clearly part of the hero. Cost: one line of height, every visit."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <WidgetRail
              initialWidgets={rail()}
              strips={strips}
              header="greeting"
              greeting={greeting}
            />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="5. Taught once, then quiet"
        note="The first visit after launch explains the change with the action right there. Once used or dismissed, only the quiet controls row remains. Cost: one-time height, and the everyday control is the weakest of the five."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <InvitationVariant />
          </HeroInFeed>
        </Stage>
      </Case>
    </Page>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { EyeCancelIcon } from '@dailydotdev/shared/src/components/icons/EyeCancel';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Case, Page, Stage } from './parts';
import { HeroInFeed } from './widgets/frame';
import { campaignStrips } from './widgets/adSlot';
import type { RailController, RailWidget } from './widgets/rail';
import { rw, WidgetRail } from './widgets/rail';
import type { WidgetKind } from './widgets/catalog';
import { widgetCatalog } from './widgets/catalog';
import { toneClass } from './data';

const meta: Meta = {
  title: 'Hero Cover/Archive/Customize options',
  // The chosen combination is the Final page (CustomizeChosen.stories.tsx).
  excludeStories: ['Chosen'],
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
  rw('codingagents', 'm'),
  rw('trending', 's'),
  rw('bookmarks', 's'),
  rw('squads', 'm'),
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

/* ================================================================== */
/* Five more                                                            */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/* 6. A pull tab on the hero's edge                                     */
/* ------------------------------------------------------------------ */

/**
 * A tab straddles the hero's right edge, like the pull on a drawer: always
 * visible, no row of its own, and its shape says "this opens". It flips to
 * Done while editing, so the way out is where the way in was.
 */
const EdgeTabVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="relative">
      <Overlay className="absolute top-1/2 flex -translate-y-1/2 translate-x-1/2 [right:-1.5rem]">
        <button
          type="button"
          onClick={() => setIsEditing((value) => !value)}
          className={classNames(
            'flex flex-col items-center gap-2 rounded-12 px-1.5 py-3 font-bold shadow-2 transition-colors typo-caption1 [writing-mode:vertical-rl]',
            isEditing
              ? 'bg-text-primary text-surface-invert'
              : 'border border-border-subtlest-tertiary bg-background-default text-text-secondary hover:text-text-primary',
          )}
        >
          <EditIcon size={IconSize.Size16} className="rotate-90" />
          {isEditing ? 'Done' : 'Customize'}
        </button>
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
/* 7. A widgets drawer                                                  */
/* ------------------------------------------------------------------ */

const drawerKinds = (Object.keys(widgetCatalog) as WidgetKind[]).filter(
  (kind) => !['ad', 'promo', 'whatsnew'].includes(kind),
);

/**
 * macOS Notification Center's Edit Widgets: a Widgets button opens a drawer
 * over the hero's end, every widget listed with what it shows, one tap to
 * add. The rail jiggles beside it, so reordering and resizing work in the
 * same moment. Adding becomes browsing, not hunting for a dashed tile.
 */
const DrawerVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const [, refresh] = useState(0);
  const controller = useRef<RailController | null>(null);
  const kinds = controller.current?.kinds ?? [];
  return (
    <div className="relative">
      <Overlay className="absolute -top-5 right-0 flex">
        <Button
          variant={isEditing ? ButtonVariant.Primary : ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={isEditing ? undefined : <PlusIcon />}
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing ? 'Done' : 'Widgets'}
        </Button>
      </Overlay>
      <WidgetRail
        initialWidgets={rail()}
        strips={strips}
        header="none"
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        controllerRef={controller}
      />
      {isEditing && (
        <Overlay className="rail-sheet absolute bottom-0 right-0 top-6 flex w-[22rem] flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-3">
          <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary p-3">
            <SearchIcon size={IconSize.Size16} className="text-text-tertiary" />
            <span className="flex-1 text-text-quaternary typo-footnote">
              Search widgets
            </span>
          </div>
          <ul className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
            {drawerKinds.map((kind) => {
              const def = widgetCatalog[kind];
              const isAdded = kinds.includes(kind);
              return (
                <li
                  key={kind}
                  className="flex items-center gap-3 rounded-12 p-2 transition-colors hover:bg-surface-hover"
                >
                  <span
                    className={classNames(
                      'flex size-9 shrink-0 items-center justify-center rounded-10',
                      toneClass[def.tone].subtle,
                      toneClass[def.tone].text,
                    )}
                  >
                    {def.icon(IconSize.Size16)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-bold text-text-primary typo-footnote">
                      {def.name}
                    </span>
                    <span className="line-clamp-1 text-text-tertiary typo-caption1">
                      {def.description}
                    </span>
                  </span>
                  {isAdded ? (
                    <span className="shrink-0 px-2 text-text-quaternary typo-caption1">
                      Added
                    </span>
                  ) : (
                    <Button
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.XSmall}
                      icon={<PlusIcon />}
                      onClick={() => {
                        controller.current?.add(kind, def.sizes[0]);
                        refresh((value) => value + 1);
                      }}
                    >
                      Add
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Overlay>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 8. One overflow menu                                                 */
/* ------------------------------------------------------------------ */

/**
 * The convention every section with options uses: one "⋯" in the corner,
 * and everything about the hero inside it. Customize, add, and the way to
 * hide the hero for a day all have a home, so none needs its own button.
 */
const MenuVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const controller = useRef<RailController | null>(null);
  const items: { label: string; icon: ReactElement; run: () => void }[] = [
    {
      label: 'Customize widgets',
      icon: <EditIcon size={IconSize.Size16} />,
      run: () => setIsEditing(true),
    },
    {
      label: 'Add a widget',
      icon: <PlusIcon size={IconSize.Size16} />,
      run: () => controller.current?.openGallery(),
    },
    {
      label: 'Hide for today',
      icon: <EyeCancelIcon size={IconSize.Size16} />,
      run: () => undefined,
    },
  ];
  return (
    <div className="relative">
      <Overlay className="absolute -top-5 right-0 flex flex-col items-end">
        {isEditing ? (
          <DoneButton onClick={() => setIsEditing(false)} />
        ) : (
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<MenuIcon />}
            aria-label="Hero options"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          />
        )}
        {isOpen && !isEditing && (
          <ul className="rail-controls-in mt-1 flex w-52 flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-3">
            {items.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    item.run();
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-8 px-2 text-left text-text-primary transition-colors typo-footnote hover:bg-surface-hover"
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Overlay>
      <WidgetRail
        initialWidgets={rail()}
        strips={strips}
        header="none"
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        controllerRef={controller}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 9. An empty slot, in view                                            */
/* ------------------------------------------------------------------ */

/**
 * The dashed "Add a widget" tile sits among the widgets the reader already
 * sees, not at the far end of the rail. An empty slot is the most explicit
 * invitation there is: it says the space is open, and what to do with it.
 */
const GhostSlotVariant = (): ReactElement => {
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
        ghostSlotAfter={1}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 10. Keyboard first                                                    */
/* ------------------------------------------------------------------ */

const Key = ({ children }: { children: ReactNode }): ReactElement => (
  <kbd className="flex h-5 min-w-5 items-center justify-center rounded-6 border border-border-subtlest-secondary bg-surface-float px-1 font-bold text-text-primary typo-caption2">
    {children}
  </kbd>
);

/**
 * For the readers who live on the keyboard, the way daily.dev already does
 * shortcuts: E customizes from anywhere on the page, and the hint shows on
 * hover so the shortcut teaches itself. Explicit for those who look, and
 * no pixels for those who don't.
 */
/** E toggles editing from anywhere on the page, except while typing. */
const useEditShortcut = (toggle: () => void): void => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key.toLowerCase() !== 'e' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return;
      }
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);
};

/** The shortcut hint is a button too: clicking it does what E does. */
const ShortcutPill = ({
  isEditing,
  onClick,
}: {
  isEditing: boolean;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-7 items-center gap-1.5 rounded-max border border-border-subtlest-tertiary bg-background-default py-1 pl-1 pr-3 text-text-tertiary shadow-2 transition-colors typo-caption1 hover:border-border-subtlest-secondary hover:text-text-primary"
  >
    <Key>E</Key>
    {isEditing ? 'Done (or Esc)' : 'Customize'}
  </button>
);

const KeyboardVariant = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const toggle = useCallback(() => setIsEditing((value) => !value), []);
  useEditShortcut(toggle);
  return (
    <div className="group/hero relative">
      <Overlay
        className={classNames(
          'absolute -top-5 right-0 flex transition-opacity duration-150',
          isEditing
            ? 'opacity-100'
            : 'opacity-0 focus-within:opacity-100 group-hover/hero:opacity-100',
        )}
      >
        <ShortcutPill isEditing={isEditing} onClick={toggle} />
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

export const MoreApproaches: StoryObj = {
  name: 'Five more',
  render: () => (
    <Page
      chapter="Customize"
      question="What other doors could the hero have?"
      title="Five more ways into customizing"
      goal="Widen the options beyond buttons near the hero: shapes that say open, panels that make adding a browse, and doors that only power users need."
      metric="Share of hero viewers who open edit mode in their first week, and how many add a widget they did not start with."
    >
      <Case
        title="Recommendation: 7 as the editor, with 4’s greeting as the door"
        note="The drawer turns adding into browsing, which is the half of customizing the other doors leave weakest: readers see every widget and what it shows, add with one tap, and rearrange in the same moment. Pair it with the greeting row from the first five, whose Customize opens the drawer. 6 is the strongest zero-height door; 10 is worth shipping alongside any of them."
      >
        <span />
      </Case>

      <Case
        title="6. A pull tab on the hero’s edge"
        note="A vertical tab straddles the hero’s right edge like a drawer pull, and flips to Done while editing. Always visible, no row. Cost: an unusual shape on the web, and it competes with the rail’s own right arrow."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <EdgeTabVariant />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="7. A widgets drawer"
        note="Widgets opens a drawer over the rail’s end with every widget and what it shows; Add drops it into the rail, which jiggles beside the drawer for reordering and resizing. Cost: the drawer covers the rail’s last columns while it is open."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <DrawerVariant />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="8. One overflow menu"
        note="One ⋯ in the corner holds Customize widgets, Add a widget and Hide for today. The convention people already know from every section with options. Cost: a menu is one step deeper, so it is explicit but not inviting."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <MenuVariant />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="9. An empty slot, in view"
        note="A dashed Add a widget slot sits among the visible widgets. It is the most explicit invitation there is, and opens the gallery straight away. Cost: it spends a whole column of the hero on an empty space."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <GhostSlotVariant />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="10. Keyboard first"
        note="Press E anywhere on the page to customize; the hint shows when the pointer is over the hero, and is itself a button, so clicking it works too. Zero pixels at rest, instant for power users. Cost: on its own, most readers will never find it; it is a companion to another door, not a door."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <KeyboardVariant />
          </HeroInFeed>
        </Stage>
      </Case>
    </Page>
  ),
};

/* ================================================================== */
/* The chosen combination                                               */
/* ================================================================== */

/**
 * The four doors picked in review, all opening the same edit mode: the
 * greeting row's Customize (with its E shortcut), Customize hero in the
 * feed's tab row, the pencil on each widget, and E from anywhere.
 */
const ChosenCombination = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const toggle = useCallback(() => setIsEditing((value) => !value), []);
  useEditShortcut(toggle);
  return (
    <HeroInFeed
      columns={5}
      chipsTrailing={
        <Overlay className="flex shrink-0 items-center gap-3">
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
        header="greeting"
        greeting={greeting}
        hasHoverEdit
        customizeShortcut="E"
        isEditing={isEditing}
        onEditingChange={setIsEditing}
      />
    </HeroInFeed>
  );
};

export const Chosen: StoryObj = {
  name: 'Chosen',
  render: () => (
    <Page
      chapter="Final · 2"
      question="How do the four picked doors work together?"
      title="Customize: the chosen four"
      goal="Combine the doors picked in review so every kind of reader finds edit mode their own way, with one edit mode behind all of them."
      metric="Share of hero viewers who open edit mode in their first week, split by which door they used."
    >
      <Case
        title="Greeting, tab row, widget pencil and E"
        note="The greeting row carries Customize, with its E shortcut on the button; the feed’s tab row ends with Customize hero; hovering any widget shows a pencil on its corner; and E works from anywhere. Every door enters and leaves the same edit mode."
      >
        <Stage columns={5}>
          <ChosenCombination />
        </Stage>
      </Case>
    </Page>
  ),
};

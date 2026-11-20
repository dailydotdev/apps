import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { PopoverContent } from '../../components/popover/Popover';
import { Button } from '../../components/buttons/Button';
import CloseButton from '../../components/CloseButton';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { PlusIcon } from '../../components/icons/Plus';
import { LayoutIcon } from '../../components/icons/Layout';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { useFeedWidgetsIntro } from './feedState';

// Kept light: the feed page renders the Customize button and the slot covers
// on every load, while the widgets, their editor and the gallery wait in
// their own chunks until a widget is placed or the reader customizes.

export type InFeedWidgetsContextValue = {
  /** The feed takes widgets: the flag is on and the grid is a grid. */
  isEnabled: boolean;
  /** Customize mode: every card's slot offers itself for a widget. */
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  /** The slot the gallery is open for. */
  addingSlot: number | null;
  setAddingSlot: (slot: number | null) => void;
  /** The widget whose settings are open, out of Customize mode. */
  configuringId?: string;
  setConfiguringId: (id?: string) => void;
  /** The widget just added or moved, flashed so the eye finds it. */
  flashId?: string;
  setFlashId: (id?: string) => void;
};

const noop = () => undefined;

const InFeedWidgetsContext = createContext<InFeedWidgetsContextValue>({
  isEnabled: false,
  isEditing: false,
  setIsEditing: noop,
  addingSlot: null,
  setAddingSlot: noop,
  setConfiguringId: noop,
  setFlashId: noop,
});

export const useInFeedWidgets = (): InFeedWidgetsContextValue =>
  useContext(InFeedWidgetsContext);

/** Customize mode's state, held by the feed page that provides it. */
export const useInFeedWidgetsState = (
  isEnabled: boolean,
): InFeedWidgetsContextValue => {
  const [isEditingState, setIsEditing] = useState(false);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const [configuringId, setConfiguringId] = useState<string>();
  const [flashId, setFlashId] = useState<string>();
  const isEditing = isEnabled && isEditingState;

  return useMemo(
    () => ({
      isEnabled,
      isEditing,
      setIsEditing,
      addingSlot: isEnabled ? addingSlot : null,
      setAddingSlot,
      configuringId,
      setConfiguringId,
      flashId,
      setFlashId,
    }),
    [isEnabled, isEditing, addingSlot, configuringId, flashId],
  );
};

export const InFeedWidgetsProvider = ({
  value,
  children,
}: {
  value: InFeedWidgetsContextValue;
  children: ReactNode;
}): ReactElement => (
  <InFeedWidgetsContext.Provider value={value}>
    {children}
  </InFeedWidgetsContext.Provider>
);

const logIntroEvent = (eventName: LogEvent) => ({
  event_name: eventName,
  target_type: TargetType.FeedWidget,
  extra: JSON.stringify({ origin: Origin.FeedWidgets }),
});

/**
 * The way into Customize mode, among the feed's own actions. Nothing renders
 * where the feed takes no widgets. The first time, it carries the intro to
 * widgets in the feed, so the reader finds both the news and the button.
 */
type FeedWidgetsCustomizeButtonProps = {
  size: ButtonSize;
  className?: string;
  iconOnly?: boolean;
};

const CustomizeButtonWithIntro = ({
  size,
  className,
  iconOnly = false,
}: FeedWidgetsCustomizeButtonProps): ReactElement => {
  const { isEditing, setIsEditing } = useInFeedWidgets();
  const { logEvent } = useLogContext();
  const intro = useFeedWidgetsIntro();
  // Closed here as soon as the reader acts, before the write lands.
  const [isIntroClosed, setIsIntroClosed] = useState(false);
  const isIntroOpen = intro.isOpen && !isIntroClosed && !isEditing;
  const hasLoggedIntro = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isIntroOpen || hasLoggedIntro.current) {
      return;
    }
    hasLoggedIntro.current = true;
    logEvent(logIntroEvent(LogEvent.ImpressionFeedWidgetsIntro));
  }, [isIntroOpen, logEvent]);

  const closeIntro = useCallback(
    (eventName: LogEvent) => {
      setIsIntroClosed(true);
      logEvent(logIntroEvent(eventName));
      intro.dismiss();
    },
    [intro, logEvent],
  );

  const onClick = useCallback(() => {
    if (!isEditing) {
      logEvent({
        event_name: LogEvent.CustomizeFeedWidgets,
        target_type: TargetType.FeedWidget,
        extra: JSON.stringify({ origin: Origin.FeedWidgets }),
      });
    }
    if (isIntroOpen) {
      closeIntro(LogEvent.ClickFeedWidgetsIntro);
    }
    setIsEditing(!isEditing);
  }, [closeIntro, isEditing, isIntroOpen, logEvent, setIsEditing]);

  return (
    <Popover
      open={isIntroOpen}
      onOpenChange={(open) => {
        if (!open && isIntroOpen) {
          closeIntro(LogEvent.DismissFeedWidgetsIntro);
        }
      }}
    >
      <PopoverAnchor asChild>
        <Button
          ref={buttonRef}
          variant={ButtonVariant.Tertiary}
          size={size}
          icon={<LayoutIcon />}
          className={className}
          aria-pressed={isEditing}
          aria-label={iconOnly ? 'Customize widgets' : undefined}
          title="Customize widgets"
          onClick={onClick}
        >
          {iconOnly ? undefined : 'Widgets'}
        </Button>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        collisionPadding={16}
        // The intro points at the button; focus stays on the feed.
        onOpenAutoFocus={(event) => event.preventDefault()}
        // A click on the button itself is the reader taking the intro up,
        // handled by the button, not a dismissal.
        onInteractOutside={(event) => {
          if (buttonRef.current?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
        className="z-header flex w-80 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2"
        aria-label="Widgets, take two"
      >
        <strong className="typo-title3">Widgets, take two</strong>
        <p className="text-text-secondary typo-callout">
          We tried widgets above the feed, and you told us they took too much
          room. So we moved them into the feed itself: swap any card for a
          widget, or add none at all. Your feed stays yours.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => closeIntro(LogEvent.DismissFeedWidgetsIntro)}
          >
            Not now
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onClick}
          >
            Add a widget
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const FeedWidgetsCustomizeButton = (
  props: FeedWidgetsCustomizeButtonProps,
): ReactElement | null => {
  const { isEnabled } = useInFeedWidgets();

  return isEnabled ? <CustomizeButtonWithIntro {...props} /> : null;
};

/**
 * What covers a feed card in Customize mode: the card's slot, offered for a
 * widget. The card stays visible underneath, so the reader sees what the
 * widget will take the place of.
 */
export const FeedWidgetSlot = ({ slot }: { slot: number }): ReactElement => {
  const { setAddingSlot } = useInFeedWidgets();

  return (
    <button
      type="button"
      onClick={() => setAddingSlot(slot)}
      aria-label="Put a widget here"
      className={classNames(
        'group/slot absolute inset-0 z-2 flex items-center justify-center rounded-16',
        // No blur: a blur over every card on screen stalls the scroll. The
        // card underneath is faded by the feed instead.
        'border-2 border-dashed border-accent-cabbage-default text-text-primary',
        'transition-colors hover:bg-overlay-float-cabbage',
        'focus-visible:bg-overlay-float-cabbage focus-visible:outline-none',
      )}
    >
      <span className="flex items-center gap-2 rounded-max bg-accent-cabbage-default py-2 pl-3 pr-4 font-bold text-white shadow-2 transition-transform typo-callout group-hover/slot:scale-105">
        <PlusIcon />
        Put a widget here
      </span>
    </button>
  );
};

/**
 * The feed's invite to a first widget: one card, covered like a slot in
 * Customize mode, that opens the gallery for its own place. It goes for good
 * once the reader closes it or places a widget anywhere.
 */
export const FeedWidgetPromo = ({
  slot,
  onDismiss,
}: {
  slot: number;
  onDismiss: () => void;
}): ReactElement => {
  const { setAddingSlot } = useInFeedWidgets();
  const { logEvent } = useLogContext();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) {
      return;
    }
    hasLogged.current = true;
    logEvent(logIntroEvent(LogEvent.ImpressionFeedWidgetsPromo));
  }, [logEvent]);

  return (
    <div className="absolute inset-0 z-2 rounded-16 border-2 border-dashed border-accent-cabbage-default bg-overlay-float-cabbage">
      <button
        type="button"
        onClick={() => {
          logEvent(logIntroEvent(LogEvent.ClickFeedWidgetsPromo));
          setAddingSlot(slot);
        }}
        className="group/promo flex h-full w-full flex-col items-center justify-center gap-3 rounded-16 p-6 text-center focus-visible:outline-none"
      >
        <strong className="text-text-primary typo-title3">
          Make this spot yours
        </strong>
        <span className="text-text-secondary typo-callout">
          Swap any card for a widget, like your streak or what’s happening now.
        </span>
        <span className="flex items-center gap-2 rounded-max bg-accent-cabbage-default py-2 pl-3 pr-4 font-bold text-white shadow-2 transition-transform typo-callout group-hover/promo:scale-105 group-focus-visible/promo:scale-105">
          <PlusIcon />
          Put a widget here
        </span>
      </button>
      <CloseButton
        size={ButtonSize.Small}
        className="absolute right-2 top-2"
        aria-label="Not now"
        onClick={() => {
          logEvent(logIntroEvent(LogEvent.DismissFeedWidgetsPromo));
          onDismiss();
        }}
      />
    </div>
  );
};

/** A placed widget's cell while its code loads: a card's height, empty. */
export const FeedWidgetCellLoading = (): ReactElement => (
  <div
    className="min-h-card w-full rounded-16 border border-border-subtlest-tertiary bg-background-subtle"
    aria-busy
  />
);

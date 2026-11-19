import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import { Button } from '../../components/buttons/Button';
import type { ButtonSize } from '../../components/buttons/common';
import { ButtonVariant } from '../../components/buttons/common';
import { PlusIcon } from '../../components/icons/Plus';
import { LayoutIcon } from '../../components/icons/Layout';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';

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

/**
 * The way into Customize mode, among the feed's own actions. Nothing renders
 * where the feed takes no widgets.
 */
export const FeedWidgetsCustomizeButton = ({
  size,
  className,
  iconOnly = false,
}: {
  size: ButtonSize;
  className?: string;
  iconOnly?: boolean;
}): ReactElement | null => {
  const { isEnabled, isEditing, setIsEditing } = useInFeedWidgets();
  const { logEvent } = useLogContext();

  const onClick = useCallback(() => {
    if (!isEditing) {
      logEvent({
        event_name: LogEvent.CustomizeFeedWidgets,
        target_type: TargetType.FeedWidget,
        extra: JSON.stringify({ origin: Origin.FeedWidgets }),
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, logEvent, setIsEditing]);

  if (!isEnabled) {
    return null;
  }

  return (
    <Button
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
  );
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
        'group/slot absolute inset-0 z-2 flex flex-col items-center justify-center gap-2 rounded-16',
        'border-2 border-dashed border-accent-cabbage-default bg-overlay-float-cabbage text-text-primary backdrop-blur-sm',
        'transition-[backdrop-filter] hover:backdrop-blur-md',
        'focus-visible:border-accent-cabbage-default focus-visible:outline-none',
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-max bg-accent-cabbage-default text-white transition-transform group-hover/slot:scale-110">
        <PlusIcon />
      </span>
      <span className="font-bold typo-callout">Put a widget here</span>
    </button>
  );
};

/** A placed widget's cell while its code loads: a card's height, empty. */
export const FeedWidgetCellLoading = (): ReactElement => (
  <div
    className="min-h-card rounded-16 border border-border-subtlest-tertiary bg-background-subtle"
    aria-busy
  />
);

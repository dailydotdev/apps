import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

type Fn = (e: MouseEvent) => void;

interface UseInteractivePopup {
  isOpen: boolean;
  // Whether a *different* popup in the same group is open. Lets a member defer
  // to a sibling for shared dismissals like Escape.
  isGroupOpen: boolean;
  onUpdate: (value: boolean) => void;
  wrapHandler: (callback: Fn) => Fn;
}

interface PopupGroupMember {
  isOpen: boolean;
  close: () => void;
}

// Module-level registry of members keyed by group. Popups passed the same group
// are mutually exclusive — opening one closes the others. This is needed because
// `wrapHandler` stops click propagation (see below), so a click that opens one
// popup never reaches the others' outside-click listeners; we close siblings
// explicitly instead.
const popupGroups = new Map<string, Set<PopupGroupMember>>();
// Each member's "a sibling changed" callback, so `isGroupOpen` can be state
// rather than a read of a mutable record during render.
const groupListeners = new Map<string, Set<() => void>>();

// We introduced this hook to wrap the issue where, if you click the trigger to open the popup
// And your popup closes on click outside, the processing time would be so fast the listener is ready even before you release your mouse
// It would result to the popup being closed. To prevent it, we stop the propagation instead of setting a timeout before adding the window event listeners
export const useInteractivePopup = (group?: string): UseInteractivePopup => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  // The record this popup contributes to its group. Held in state so it is
  // created once and the closure below can point back at it.
  const [member] = useState<PopupGroupMember>(() => {
    const created: PopupGroupMember = {
      isOpen: false,
      close: () => {
        created.isOpen = false;
        setIsOpen(false);
      },
    };

    return created;
  });

  useEffect(() => {
    if (!group) {
      return undefined;
    }

    const members = popupGroups.get(group) ?? new Set<PopupGroupMember>();
    popupGroups.set(group, members);
    members.add(member);

    const listeners = groupListeners.get(group) ?? new Set<() => void>();
    groupListeners.set(group, listeners);
    const sync = () =>
      setIsGroupOpen(
        Array.from(members).some((other) => other !== member && other.isOpen),
      );
    listeners.add(sync);
    sync();

    return () => {
      members.delete(member);
      listeners.delete(sync);
      listeners.forEach((listener) => listener());

      if (!members.size) {
        popupGroups.delete(group);
      }

      if (!listeners.size) {
        groupListeners.delete(group);
      }
    };
  }, [group, member]);

  const onUpdate = useCallback(
    (value: boolean) => {
      member.isOpen = value;

      if (!group) {
        setIsOpen(value);
        return;
      }

      if (value) {
        popupGroups.get(group)?.forEach((other) => {
          if (other !== member) {
            other.close();
          }
        });
      }

      setIsOpen(value);
      groupListeners.get(group)?.forEach((listener) => listener());
    },
    [group, member],
  );

  const handleTrigger = useCallback((callback: Fn): Fn => {
    return (e: MouseEvent) => {
      e.stopPropagation();
      callback(e);
    };
  }, []);

  return {
    isOpen,
    isGroupOpen,
    onUpdate,
    wrapHandler: handleTrigger,
  };
};

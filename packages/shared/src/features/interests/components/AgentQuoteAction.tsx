import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { AgentAddToChatButton } from './AgentAddToChatButton';
import { quoteAttachment } from '../attachments';

type Spot = { text: string; left: number; top: number; isBelow: boolean };

// A stray double-click lands one or two characters; nothing worth quoting.
const minLength = 3;
// Below this much room above the highlight, the button would sit behind the
// header, so it flips underneath instead.
const headroom = 48;

const readSelection = (container: HTMLElement | null): Spot | undefined => {
  const selection = globalThis.getSelection?.();
  const text = selection?.toString().trim() ?? '';

  if (!selection || !selection.rangeCount || text.length < minLength) {
    return undefined;
  }

  const range = selection.getRangeAt(0);

  if (!container?.contains(range.commonAncestorContainer)) {
    return undefined;
  }

  const rect = range.getBoundingClientRect();
  const bounds = container.getBoundingClientRect();

  // Scrolled out of the transcript: the coordinates are still real, but would
  // put the button over the header or the composer.
  if (rect.bottom < bounds.top || rect.top > bounds.bottom) {
    return undefined;
  }

  const isBelow = rect.top - bounds.top < headroom;

  return {
    text,
    left: rect.left + rect.width / 2,
    top: isBelow ? rect.bottom : rect.top,
    isBelow,
  };
};

export const AgentQuoteAction = ({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement>;
}): ReactElement | null => {
  const [spot, setSpot] = useState<Spot>();

  useEffect(() => {
    const show = () => setSpot(readSelection(containerRef.current));
    // Repositioning on every selectionchange drags the button under the cursor
    // mid-highlight, so this listener only ever removes it.
    const hideIfGone = () => {
      if (globalThis.getSelection?.()?.isCollapsed !== false) {
        setSpot(undefined);
      }
    };

    document.addEventListener('selectionchange', hideIfGone);
    document.addEventListener('pointerup', show);
    document.addEventListener('keyup', show);
    // Fixed coordinates go stale the moment anything moves under them.
    globalThis.addEventListener('scroll', show, true);
    globalThis.addEventListener('resize', show);

    return () => {
      document.removeEventListener('selectionchange', hideIfGone);
      document.removeEventListener('pointerup', show);
      document.removeEventListener('keyup', show);
      globalThis.removeEventListener('scroll', show, true);
      globalThis.removeEventListener('resize', show);
    };
  }, [containerRef]);

  if (!spot) {
    return null;
  }

  return createPortal(
    // Portaled to the body: the transcript clips its overflow and the turns
    // animate on a transform, which traps a fixed child.
    <div
      style={{ left: spot.left, top: spot.top }}
      className={classNames(
        'fixed z-popup -translate-x-1/2',
        spot.isBelow ? 'pt-2' : '-translate-y-full pb-2',
      )}
    >
      {/* The animation owns `transform`, so it needs its own element apart
          from the positioning translate. */}
      <span className="agent-menu-in block">
        <AgentAddToChatButton
          attachment={quoteAttachment(spot.text)}
          className="shadow-2"
          // A pointer down outside the range would collapse the selection
          // before the click reached the button.
          onMouseDown={(event) => event.preventDefault()}
          onAttached={() => {
            globalThis.getSelection?.()?.removeAllRanges();
            setSpot(undefined);
          }}
        />
      </span>
    </div>,
    document.body,
  );
};

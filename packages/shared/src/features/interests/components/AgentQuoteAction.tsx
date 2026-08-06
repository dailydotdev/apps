import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { AgentAddToChatButton } from './AgentAddToChatButton';
import { quoteAttachment } from '../attachments';

type Spot = { text: string; left: number; top: number; isBelow: boolean };

// A stray double-click lands one or two characters; nothing worth quoting.
const minLength = 3;
// Clearance for the button, so a highlight near the top of the transcript gets
// it underneath instead of behind the header.
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

  // Scrolled out of the transcript: the coordinates are still real, but they
  // would put the button over the header or the composer.
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

/**
 * Highlight a line in a reply and the way into the chat comes to it.
 *
 * The same button the cards carry, brought to the passage rather than to the
 * block that holds it, so a name, a number or one sentence can be the thing
 * the next prompt is about.
 */
export const AgentQuoteAction = ({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement>;
}): ReactElement | null => {
  const [spot, setSpot] = useState<Spot>();

  useEffect(() => {
    const show = () => setSpot(readSelection(containerRef.current));
    // Following every selectionchange would drag the button along under the
    // cursor mid-highlight. It only ever takes one away.
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
    // Portaled to the body: the transcript clips its own overflow, and the
    // turns animate in on a transform, which would trap a fixed child.
    <div
      style={{ left: spot.left, top: spot.top }}
      className={classNames(
        'fixed z-popup -translate-x-1/2',
        spot.isBelow ? 'pt-2' : '-translate-y-full pb-2',
      )}
    >
      {/* The animation owns `transform`, so it cannot share an element with
          the positioning translate. */}
      <span className="agent-menu-in block">
        <AgentAddToChatButton
          attachment={quoteAttachment(spot.text)}
          className="border border-border-subtlest-tertiary shadow-2"
          // Without this the pointer going down outside the range collapses
          // the selection before the click ever reaches the button.
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

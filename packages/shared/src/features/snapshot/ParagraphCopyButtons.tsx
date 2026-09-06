import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CopyStateIcon } from '../../components/share/CopyStateIcon';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { useCopyText } from '../../hooks/useCopy';

/** A one-line paragraph is a caption or a stub; copying it helps nobody. */
const MIN_LENGTH = 80;

const SLOT_ATTRIBUTE = 'data-paragraph-copy';

const ParagraphCopy = ({ text }: { text: string }): ReactElement => {
  const [copied, copy] = useCopyText(text);

  return (
    <Tooltip content="Copy paragraph">
      <Button
        aria-label="Copy paragraph"
        // Trails the last line rather than sitting under the block, so a body
        // of many paragraphs does not become a column of buttons.
        className="ml-1 align-middle !text-text-quaternary"
        icon={<CopyStateIcon copied={copied} />}
        onClick={() => copy({ message: 'Copied paragraph' })}
        size={ButtonSize.XSmall}
        type="button"
        variant={ButtonVariant.Tertiary}
      />
    </Tooltip>
  );
};

/**
 * A copy control at the end of every paragraph of a rendered markdown body.
 *
 * The body is sanitized HTML written straight into the DOM, so there is no JSX
 * to hang a button off. Each paragraph gets an empty span appended once and the
 * button is portalled into it: React keeps ownership of the control while the
 * markup underneath stays the renderer's.
 */
export function ParagraphCopyButtons({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement>;
}): ReactElement | null {
  const [slots, setSlots] = useState<{ node: HTMLElement; text: string }[]>([]);
  // The observer fires on the spans this appends, so a signature guards the
  // loop that would otherwise start.
  const signature = useRef<string>('');

  const sync = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const paragraphs = Array.from(container.querySelectorAll('p')).filter(
      (paragraph) => (paragraph.textContent ?? '').trim().length >= MIN_LENGTH,
    );
    const nextSignature = paragraphs
      .map((paragraph) => (paragraph.textContent ?? '').trim())
      .join(' ');

    if (nextSignature === signature.current) {
      return;
    }

    signature.current = nextSignature;
    setSlots(
      paragraphs.map((paragraph) => {
        const text = (paragraph.textContent ?? '').trim();
        const existing = paragraph.querySelector<HTMLElement>(
          `[${SLOT_ATTRIBUTE}]`,
        );

        if (existing) {
          return { node: existing, text };
        }

        const slot = document.createElement('span');
        slot.setAttribute(SLOT_ATTRIBUTE, '');
        paragraph.appendChild(slot);

        return { node: slot, text };
      }),
    );
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    sync();

    // The body is sanitized asynchronously, so the paragraphs arrive after the
    // first render rather than with it.
    const observer = new MutationObserver(sync);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [containerRef, sync]);

  if (!slots.length) {
    return null;
  }

  return (
    <>
      {slots.map(({ node, text }) =>
        createPortal(<ParagraphCopy text={text} />, node),
      )}
    </>
  );
}

import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Post } from '../../graphql/posts';
import { TextSnapshotButton } from './TextSnapshotButton';

/** A one-line paragraph is a caption or a stub; sharing it helps nobody. */
const MIN_LENGTH = 80;

const SLOT_ATTRIBUTE = 'data-paragraph-snapshot';

/**
 * A snapshot control at the end of every paragraph of a rendered markdown
 * body, so a claim can be lifted out of a freeform post as a card the way the
 * TLDR and a highlighted quote can.
 *
 * The body is sanitized HTML written straight into the DOM, so there is no JSX
 * to hang a button off. Each paragraph gets an empty span appended once and the
 * button is portalled into it: React keeps ownership of the control while the
 * markup underneath stays the renderer's.
 */
export function ParagraphSnapshotButtons({
  containerRef,
  post,
}: {
  containerRef: RefObject<HTMLElement>;
  post: Post;
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
        createPortal(
          <TextSnapshotButton
            filename={`daily-paragraph-${post.id}`}
            post={post}
            text={text}
          />,
          node,
        ),
      )}
    </>
  );
}

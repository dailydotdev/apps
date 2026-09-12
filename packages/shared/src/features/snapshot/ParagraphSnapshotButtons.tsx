import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Post } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { TextSnapshotButton } from './TextSnapshotButton';

/** A one-line paragraph is a caption or a stub; sharing it helps nobody. */
const MIN_LENGTH = 80;

const SLOT_ATTRIBUTE = 'data-paragraph-snapshot';

/**
 * The paragraph's own words, with whatever this has appended to it left out.
 * Reading `textContent` straight would fold the control — and anything it ever
 * renders — into the text the button captures, and into the signature that
 * decides whether the body has changed.
 */
const proseOf = (paragraph: HTMLElement, omit?: string): string => {
  const clone = paragraph.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll(`[${SLOT_ATTRIBUTE}]`)
    .forEach((slot) => slot.remove());

  if (omit) {
    clone.querySelectorAll(omit).forEach((node) => node.remove());
  }

  return (clone.textContent ?? '').trim();
};

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
  selector = 'p',
  omit,
  origin = Origin.PostParagraph,
  ariaLabel,
}: {
  containerRef: RefObject<HTMLElement>;
  post: Post;
  /** Which blocks of the body get a control. */
  selector?: string;
  /** What a block renders beyond its passage, like a trailing link. */
  omit?: string;
  /** Which surface the body is on, for the snapshot's share event. */
  origin?: Origin;
  /** Names each control after its passage, where the shared label repeats. */
  ariaLabel?: (passage: string) => string;
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

    const paragraphs = Array.from(
      container.querySelectorAll<HTMLElement>(selector),
    ).filter((paragraph) => proseOf(paragraph, omit).length >= MIN_LENGTH);
    const nextSignature = paragraphs
      .map((paragraph) => proseOf(paragraph, omit))
      .join(' ');

    if (nextSignature === signature.current) {
      return;
    }

    signature.current = nextSignature;
    setSlots(
      paragraphs.map((paragraph) => {
        const text = proseOf(paragraph, omit);
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
  }, [containerRef, omit, selector]);

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
            ariaLabel={ariaLabel?.(text)}
            filename={`daily-paragraph-${post.id}`}
            origin={origin}
            post={post}
            text={text}
          />,
          node,
        ),
      )}
    </>
  );
}

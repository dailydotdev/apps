import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  SNAPSHOT_LABEL,
  SnapshotButton,
} from '../../../components/imageShare/SnapshotButton';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { ListSnapshotCard } from '../../snapshot/ListSnapshotCard';
import { getSnapshotCaptureOptions } from '../../snapshot/snapshotCapture';
import { useArmedCard } from '../../snapshot/useArmedCard';
import { useLogSnapshot } from '../../snapshot/useLogSnapshot';
import { getBriefSection, splitBriefBullet } from '../briefBodyBlocks';

const SECTION = 'Must know';
/** As many rows as ListSnapshotCard draws. */
const MAX_ITEMS = 5;
const SLOT_ATTRIBUTE = 'data-brief-section-snapshot';

interface Slot {
  node: HTMLElement;
  titles: string[];
}

/**
 * A snapshot on the Must know heading that captures that section's bullets as
 * one card. The heading lives in Markdown's rendered HTML, so the button is
 * portalled into an empty span appended to it, like ParagraphSnapshotButtons.
 */
export function BriefMustKnowSnapshotButton({
  containerRef,
  post,
}: {
  containerRef: RefObject<HTMLElement>;
  post: Post;
}): ReactElement | null {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isArmed, armProps } = useArmedCard();
  const logSnapshot = useLogSnapshot(post, Origin.BriefMustKnow);
  const [slot, setSlot] = useState<Slot | null>(null);
  const posts = post.flags?.posts;
  const sources = post.flags?.sources;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const sync = () => {
      const section = getBriefSection(container, SECTION);
      const titles = Array.from(
        new Set(section?.blocks.map(splitBriefBullet)),
      ).slice(0, MAX_ITEMS);

      if (!section || !titles.length) {
        setSlot(null);
        return;
      }

      const existing = section.heading.querySelector<HTMLElement>(
        `[${SLOT_ATTRIBUTE}]`,
      );
      const node = existing ?? document.createElement('span');

      if (!existing) {
        node.setAttribute(SLOT_ATTRIBUTE, '');
        section.heading.appendChild(node);
      }

      // The observer fires on the span this appends and on every render of
      // the button inside it, so an unchanged section keeps the same state.
      setSlot((current) =>
        current?.node === node &&
        current.titles.join('\n') === titles.join('\n')
          ? current
          : { node, titles },
      );
    };

    sync();

    // The body is sanitized after the first render, so the heading arrives
    // later than this effect does.
    const observer = new MutationObserver(sync);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [containerRef]);

  if (!slot) {
    return null;
  }

  return (
    <>
      {createPortal(
        <span className="contents" {...armProps}>
          <SnapshotButton
            ariaLabel={`${SNAPSHOT_LABEL}: ${SECTION}`}
            captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
            className="ml-2 align-middle"
            filename={`daily-brief-${post.id}`}
            onResult={logSnapshot}
            showLabel={false}
            size={ButtonSize.Small}
            target={cardRef}
            variant={ButtonVariant.Tertiary}
          />
        </span>,
        slot.node,
      )}
      {isArmed && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-300vw] top-0"
        >
          <ListSnapshotCard
            ref={cardRef}
            eyebrow={SECTION}
            grow
            items={slot.titles.map((title) => ({ title }))}
            seed={post.id}
            subtitle={
              posts && sources
                ? `${posts} posts from ${sources} sources`
                : undefined
            }
            title={post.title ?? SECTION}
          />
        </div>
      )}
    </>
  );
}

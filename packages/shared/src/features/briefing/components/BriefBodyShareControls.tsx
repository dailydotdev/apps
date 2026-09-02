import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/Button';
import { SnapshotButton } from '../../../components/imageShare/SnapshotButton';
import type { Post } from '../../../graphql/posts';
import { featureBriefingShareControls } from '../../../lib/featureManagement';
import { ListSnapshotCard } from '../../snapshot/ListSnapshotCard';
import type { SnapshotListItem } from '../../snapshot/ListSnapshotCard';
import { SNAPSHOT_SIZE } from '../../snapshot/snapshotGradient';
import { useSharePlacement } from '../../snapshot/useSharePlacement';
import {
  getBriefBlocks,
  getBriefSection,
  splitBriefBullet,
} from '../briefBodyBlocks';
import { BriefBlockCopyButton } from './BriefBlockCopyButton';

/** The section whose bullets are worth a card of their own. */
const SNAPSHOT_SECTION = 'Must know';

/** Marks the nodes this component owns inside Markdown's rendered output. */
const HOST_ATTRIBUTE = 'data-brief-control';

const CAPTURE_OPTIONS = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

interface Mounts {
  copy: { host: HTMLElement; text: string }[];
  snapshot?: { host: HTMLElement; items: SnapshotListItem[] };
}

/**
 * The controls the brief body cannot declare in JSX. The body is a single
 * `<Markdown content={contentHtml} />`, so there are no per-bullet nodes to
 * hang a button off: these are portalled into the rendered blocks instead, and
 * the text they share is read back out of the DOM the reader is looking at.
 */
export function BriefBodyShareControls({
  post,
  bodyRef,
  contentHtml,
}: {
  post: Post;
  bodyRef: RefObject<HTMLElement>;
  contentHtml?: string;
}): ReactElement | null {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounts, setMounts] = useState<Mounts>({ copy: [] });
  const isEnabled = useSharePlacement({
    feature: featureBriefingShareControls,
  });

  useEffect(() => {
    const container = bodyRef.current;

    if (!isEnabled || !container) {
      return undefined;
    }

    // Anything left by an earlier run of this effect. React invokes effects
    // twice in development, and Markdown re-renders on its own for hover cards
    // and the image modal, so a stray host is a question of when, not if.
    container
      .querySelectorAll(`[${HOST_ATTRIBUTE}]`)
      .forEach((stray) => stray.remove());

    const hosts: HTMLElement[] = [];
    // A span of our own inside each block, so the portal never fights Markdown
    // for the block's own children.
    const anchor = (node: HTMLElement) => {
      const host = document.createElement('span');
      host.className = 'inline-flex align-middle';
      host.setAttribute(HOST_ATTRIBUTE, '');
      node.appendChild(host);
      hosts.push(host);

      return host;
    };

    const copy = getBriefBlocks(container).map((block) => ({
      host: anchor(block.node),
      text: block.text,
    }));

    const section = getBriefSection(container, SNAPSHOT_SECTION);
    const items = section?.blocks.slice(0, 5).map((block) => {
      const { lead, rest } = splitBriefBullet(block.text);

      return { title: lead, meta: rest };
    });

    setMounts({
      copy,
      snapshot:
        section && items?.length
          ? { host: anchor(section.heading), items }
          : undefined,
    });

    return () => {
      hosts.forEach((host) => host.remove());
      setMounts({ copy: [] });
    };
  }, [bodyRef, contentHtml, isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {mounts.copy.map(({ host, text }) =>
        createPortal(
          <BriefBlockCopyButton link={post.commentsPermalink} text={text} />,
          host,
          text,
        ),
      )}

      {mounts.snapshot &&
        createPortal(
          <SnapshotButton
            captureOptions={CAPTURE_OPTIONS}
            className="ml-2"
            filename={`daily-brief-${post.id}`}
            link={post.commentsPermalink}
            showLabel={false}
            size={ButtonSize.Small}
            target={cardRef}
            variant={ButtonVariant.Tertiary}
          />,
          mounts.snapshot.host,
          'must-know-snapshot',
        )}

      {/* The card the capture reads from, off-screen at its full 1080px. */}
      {mounts.snapshot && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-300vw] top-0"
        >
          <ListSnapshotCard
            ref={cardRef}
            eyebrow={SNAPSHOT_SECTION}
            items={mounts.snapshot.items}
            seed={post.id}
            title={post.title ?? SNAPSHOT_SECTION}
          />
        </div>
      )}
    </>
  );
}

import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import Markdown from '../Markdown';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyIcon, VIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import type { Post } from '../../graphql/posts';
import { useCopyText } from '../../hooks/useCopy';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { useActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { ReferralCampaignKey } from '../../lib/referral';
import { ToastType } from '../../hooks/useToastNotification';
import { useShareBriefingDigest } from '../../hooks/useShareBriefingDigest';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { LogEvent } from '../../lib/log';
import type { Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

// The briefing body is sanitized HTML from `Markdown`, so per-item controls
// can't be composed in JSX. A mount node is appended to each bullet and section
// heading instead, and the button is portalled into it.
const MOUNT_CLASS = 'brief-item-copy-mount';
// Deliberately wide. The body is model-generated markdown, so the heading level
// and whether a section uses bullets or prose vary between briefings — matching
// only `h2`/`h3`/`li` meant a brief written as plain paragraphs got no controls
// at all, which reads as the feature being missing rather than not applicable.
const ITEM_SELECTOR = 'h1, h2, h3, h4, li, p';
const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4']);

// A paragraph nested inside a list item or a quote is part of that item, not an
// item of its own — it would get a second, redundant control.
const isNestedProse = (element: HTMLElement): boolean =>
  element.tagName === 'P' && !!element.closest('li, blockquote');

type BriefItemKind = 'bullet' | 'paragraph' | 'section';

const kindOf = (element: HTMLElement): BriefItemKind => {
  if (HEADING_TAGS.has(element.tagName)) {
    return 'section';
  }

  return element.tagName === 'LI' ? 'bullet' : 'paragraph';
};

interface BriefItem {
  mount: HTMLElement;
  kind: BriefItemKind;
  element: HTMLElement;
}

const readText = (element: Element): string => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(`.${MOUNT_CLASS}`).forEach((node) => node.remove());

  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
};

// Lists have to be read item by item — collapsing a whole `<ul>` with
// `textContent` runs every bullet together into one unreadable paragraph.
const readBlock = (element: Element): string => {
  if (element.tagName !== 'UL' && element.tagName !== 'OL') {
    return readText(element);
  }

  return Array.from(element.children)
    .filter((child) => child.tagName === 'LI')
    .map((item) => `- ${readText(item)}`)
    .join('\n');
};

// A section is its heading plus everything up to the next heading — copying only
// the heading text would paste a title with no substance.
const readSectionText = (heading: HTMLElement): string => {
  const parts = [readText(heading)];
  let node = heading.nextElementSibling;

  while (node && !HEADING_TAGS.has(node.tagName)) {
    parts.push(readBlock(node));
    node = node.nextElementSibling;
  }

  return parts.filter(Boolean).join('\n\n');
};

export interface BriefContentProps {
  post: Post;
  origin: Origin;
  contentHtml: string;
  className?: string;
  /**
   * Renders the per-item copy controls. Left undefined it resolves from the
   * `share_briefing_digest` gate; pass it explicitly to pin a state in
   * Storybook or tests, where GrowthBook is mocked.
   */
  showItemActions?: boolean;
}

export const BriefContent = ({
  post,
  origin,
  contentHtml,
  className,
  showItemActions,
}: BriefContentProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<BriefItem[]>([]);
  const isShareEnabled = useShareBriefingDigest();
  const showItems = showItemActions ?? isShareEnabled;
  const [, copyText] = useCopyText();
  const [copiedKey, markCopied] = useCopyFeedback();
  const { logOpts } = useActiveFeedContext();

  // The link that rides along with every copy has to carry referral
  // attribution, exactly like `useSharePost().copyLink` does — a bare
  // permalink would make these the only shares in the app that go
  // uncredited. Resolved up front so the click handler stays synchronous:
  // awaiting inside it would put the clipboard write outside the user
  // gesture.
  const permalink = post.commentsPermalink;
  const { shareLink, getTrackedUrl } = useGetShortUrl({
    query: permalink
      ? { url: permalink, cid: ReferralCampaignKey.SharePost }
      : undefined,
  });
  const shareUrl = permalink
    ? shareLink ?? getTrackedUrl(permalink, ReferralCampaignKey.SharePost)
    : '';
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();

  const scan = useCallback(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    const next = Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
      .filter((element) => !isNestedProse(element) && !!readText(element))
      .map((element) => {
        // Walk the children rather than using `:scope >` — the Tailwind group
        // class added below contains a `/`, which some selector engines (jsdom's
        // included) fail to escape when they expand `:scope`.
        const existing = Array.from(element.children).find((child) =>
          child.classList.contains(MOUNT_CLASS),
        ) as HTMLElement | undefined;
        const mount = existing ?? document.createElement('span');

        if (!existing) {
          mount.className = MOUNT_CLASS;
          element.appendChild(mount);
        }

        element.classList.add('group/brief-item');

        return { mount, element, kind: kindOf(element) };
      });

    // Portalling into the mounts mutates the tree and re-triggers the observer;
    // bail out when nothing actually changed so the loop settles.
    setItems((prev) =>
      prev.length === next.length &&
      prev.every((item, index) => item.mount === next[index].mount)
        ? prev
        : next,
    );
  }, []);

  useEffect(() => {
    const root = containerRef.current;

    if (!root || !showItems) {
      setItems((prev) => (prev.length ? [] : prev));
      return undefined;
    }

    // `Markdown` sanitizes asynchronously (DOMPurify loads in one of its own
    // effects), so the body lands on a later render of the *child* — which does
    // not re-run this component's effects. Watching the subtree is the only
    // reliable signal. `scan` reuses existing mounts and `setItems` bails when
    // nothing changed, so the mutations it causes settle after one extra pass.
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) {
        return;
      }

      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        scan();
      });
    });

    observer.observe(root, { childList: true, subtree: true });
    scan();

    return () => observer.disconnect();
  }, [scan, showItems, contentHtml]);

  const onCopyItem = (item: BriefItem, key: string) => {
    const text =
      item.kind === 'section'
        ? readSectionText(item.element)
        : readText(item.element);

    markCopied(key);

    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: {
          provider: ShareProvider.CopyText,
          origin,
          content: `brief_${item.kind}`,
        },
        ...(logOpts && logOpts),
      }),
    );

    // `ToastType.Success` renders the design system's green checkmark, so the
    // toast and the button's own confirmation say the same thing — no need for
    // the ✅ the older copy strings prefix by hand.
    copyText({
      textToCopy: `${text}\n\n${shareUrl}`.trim(),
      message:
        item.kind === 'section'
          ? 'Copied section to clipboard'
          : 'Copied to clipboard',
      variant: ToastType.Success,
    });
  };

  return (
    <div ref={containerRef} className={className}>
      <Markdown content={contentHtml} />
      {items.map((item, index) => {
        const key = `${item.kind}-${index}`;
        const isCopied = copiedKey === key;
        const label = item.kind === 'section' ? 'Copy section' : 'Copy item';

        return createPortal(
          <Tooltip content={isCopied ? 'Copied!' : label}>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              aria-label={label}
              // Always CopyIcon, never the link glyph, and deliberately not
              // gated on `share_copy_icon`: this copies the item's *text* with
              // the briefing link appended, so what lands on the clipboard is
              // quotable and still carries attribution. The link glyph is
              // reserved for controls that copy the bare URL.
              icon={
                isCopied ? (
                  <VIcon className="text-status-success" />
                ) : (
                  <CopyIcon />
                )
              }
              // `align-middle` centres the box on baseline + half the
              // x-height, which reads low against the text's optical centre.
              // The correction is ~half the cap-height/x-height difference and
              // scales with font size, so it has to be in `em` — a px nudge
              // that suits a bullet is visibly wrong on a section heading.
              //
              // Revealed on hover of its own item, so a briefing reads as prose
              // until you reach for a control. Touch has no hover, so coarse
              // pointers get them outright — otherwise they would be
              // unreachable there. Keyboard focus reveals them too, and the
              // control stays pinned while it is confirming so the checkmark
              // survives the pointer leaving as the click lands.
              className={classNames(
                'ml-2 inline-flex -translate-y-[0.15em] align-middle transition-opacity focus-visible:opacity-100 group-hover/brief-item:opacity-100 [@media(pointer:coarse)]:opacity-100',
                isCopied ? 'opacity-100' : 'opacity-0',
              )}
              onClick={() => onCopyItem(item, key)}
            />
          </Tooltip>,
          item.mount,
          key,
        );
      })}
    </div>
  );
};

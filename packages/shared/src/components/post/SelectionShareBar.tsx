import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Post } from '../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyIcon, LinkIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { RootPortal } from '../tooltips/Portal';
import { useCopyText } from '../../hooks/useCopy';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { useTextSelectionShare } from '../../hooks/useTextSelectionShare';
import { useSharingVisibility } from '../../hooks/useSharingVisibility';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import { useEventListener } from '../../hooks/useEventListener';
import { useVisualViewport } from '../../hooks/utils/useVisualViewport';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { featureShareTextSelection } from '../../lib/featureManagement';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';
import { webappUrl } from '../../lib/constants';

export interface SelectionShareBarProps {
  post: Post;
  /** The post body. Only selections made inside it raise the bar. */
  containerRef: RefObject<HTMLElement>;
}

// Quote images read badly past a couple of sentences, and the text rides in the
// generator URL, so cap it well below any browser URL limit.
const MAX_QUOTE_LENGTH = 280;
// Breathing room between the selection and the bar.
const ANCHOR_GAP = 8;
// Below this distance from the top of the viewport there is no room above the
// selection, so the bar flips underneath it.
const FLIP_THRESHOLD = 64;
const VIEWPORT_MARGIN = 8;
const FALLBACK_BAR_WIDTH = 160;

// The quote-image route renders headlessly for the screenshot service, so
// there is no user-facing entry point yet: sending someone to the raw
// generator page lands them on a bare 1200x630 bitmap template. Exported for
// the image-generator route and for the follow-up that turns this into a
// previewable, downloadable share once the service serves the PNG.
export const buildQuoteImageUrl = (postId: string, text: string): string => {
  const quote =
    text.length > MAX_QUOTE_LENGTH
      ? `${text.slice(0, MAX_QUOTE_LENGTH).trimEnd()}…`
      : text;

  return `${webappUrl}image-generator/quote/${postId}?text=${encodeURIComponent(
    quote,
  )}`;
};

// The bar itself. Split from the flag gate below so a disabled experiment
// mounts none of these hooks — and therefore attaches no listeners at all.
function SelectionShareBarContent({
  post,
  containerRef,
}: SelectionShareBarProps): ReactElement | null {
  const { text, rect, clear } = useTextSelectionShare({ containerRef });
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(FALLBACK_BAR_WIDTH);
  const { width: viewportWidth } = useVisualViewport();
  const [viewportOffset, setViewportOffset] = useState({ left: 0, top: 0 });

  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const [, shareOrCopyLink] = useShareOrCopyLink({
    link: post.commentsPermalink,
    text: text ?? post.title ?? '',
    cid: ReferralCampaignKey.SharePost,
  });
  const [, copyText] = useCopyText();

  const dismiss = useCallback(() => {
    globalThis?.window?.getSelection?.()?.removeAllRanges();
    clear();
  }, [clear]);

  const logShare = useCallback(
    (provider: ShareProvider) => {
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin: Origin.TextSelection },
        }),
      );
    },
    [logEvent, post, postLogEvent],
  );

  useLayoutEffect(() => {
    if (barRef.current) {
      setBarWidth(barRef.current.offsetWidth);
    }
  }, [text]);

  useOutsideClick(
    barRef,
    (event) => {
      // Clicks back inside the body collapse the selection on their own; acting
      // here too would race the browser and drop the bar mid-drag.
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      clear();
    },
    !!text,
  );

  useEventListener(
    text ? globalThis?.document : null,
    'keydown',
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss();
      }
    },
  );

  // Pinch-zoom pans the visual viewport without moving the layout viewport that
  // a `fixed` element is positioned in, so track the offset and clamp to it.
  useEventListener(
    text ? globalThis?.window?.visualViewport : null,
    'scroll',
    () => {
      const viewport = globalThis?.window?.visualViewport;
      setViewportOffset({
        left: viewport?.offsetLeft ?? 0,
        top: viewport?.offsetTop ?? 0,
      });
    },
  );

  if (!text || !rect) {
    return null;
  }

  const availableWidth = viewportWidth || globalThis?.window?.innerWidth || 0;
  const half = barWidth / 2;
  const minCenter = viewportOffset.left + VIEWPORT_MARGIN + half;
  const maxCenter =
    viewportOffset.left + availableWidth - VIEWPORT_MARGIN - half;
  const center = rect.left + (rect.right - rect.left) / 2;
  const left = Math.min(
    Math.max(center, minCenter),
    Math.max(minCenter, maxCenter),
  );
  const flipsBelow = rect.top - viewportOffset.top < FLIP_THRESHOLD;
  const top = flipsBelow ? rect.bottom + ANCHOR_GAP : rect.top - ANCHOR_GAP;

  const onCopyLink = () => {
    logShare(ShareProvider.CopyLink);
    shareOrCopyLink();
  };

  const onCopyText = () => {
    logShare(ShareProvider.CopyText);
    copyText({ textToCopy: text, message: '✅ Copied text to clipboard' });
  };

  return (
    <RootPortal>
      <div
        ref={barRef}
        role="toolbar"
        aria-label="Share selected text"
        data-testid="selectionShareBar"
        className="fixed z-modal flex animate-composer-in items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2 motion-reduce:animate-none"
        style={{
          left,
          top,
          transform: `translate(-50%, ${flipsBelow ? '0' : '-100%'})`,
        }}
      >
        <Tooltip content="Copy link to this post">
          <Button
            type="button"
            aria-label="Copy link to this post"
            icon={<LinkIcon />}
            onClick={onCopyLink}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        <Tooltip content="Copy selected text">
          <Button
            type="button"
            aria-label="Copy selected text"
            icon={<CopyIcon />}
            onClick={onCopyText}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
      </div>
    </RootPortal>
  );
}

/**
 * Floating share bar for text selected inside a post body. Flag-off it renders
 * nothing and, because every listener lives in the inner component, attaches no
 * selection/viewport listeners at all.
 */
export function SelectionShareBar(
  props: SelectionShareBarProps,
): ReactElement | null {
  const { isEnabled: isSharingVisible } = useSharingVisibility();
  const { value: isSelectionShareOn } = useConditionalFeature({
    feature: featureShareTextSelection,
    shouldEvaluate: isSharingVisible,
  });

  if (!isSharingVisible || !isSelectionShareOn) {
    return null;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <SelectionShareBarContent {...props} />;
}

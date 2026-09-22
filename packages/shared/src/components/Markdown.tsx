import type {
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
} from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import styles from './markdown.module.css';
import type { CaretOffset } from '../lib/element';
import useDebounceFn from '../hooks/useDebounceFn';
import { useDomPurify } from '../hooks/useDomPurify';
import { getUserShortInfo } from '../graphql/users';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { getImageOriginRect } from './modals/ImageModal';
import { useRequestProtocol } from '../hooks/useRequestProtocol';
import { isImageUrl } from '../lib/image';

function isImageElement(
  element: Element | EventTarget,
): element is HTMLImageElement {
  return element instanceof HTMLImageElement;
}

function getTargetElement(target: EventTarget): Element | null {
  if (target instanceof Element) {
    return target;
  }

  if (target instanceof Node) {
    return target.parentElement;
  }

  return null;
}

function getWrappingAnchor(
  element: Element,
  container: HTMLElement | null,
): HTMLAnchorElement | null {
  let currentElement: Element | null = element;

  while (currentElement && currentElement !== container) {
    if (currentElement instanceof HTMLAnchorElement) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return null;
}

function isSameUrl(url: string, otherUrl: string): boolean {
  try {
    return new URL(url).href === new URL(otherUrl).href;
  } catch {
    return url === otherUrl;
  }
}

function shouldOpenAnchorImage(
  anchor: HTMLAnchorElement | null,
  imageSrc: string,
): boolean {
  if (!anchor?.href) {
    return true;
  }

  return isImageUrl(anchor.href) || isSameUrl(anchor.href, imageSrc);
}

const UserEntityCard = dynamic(() => import('./cards/entity/UserEntityCard'), {
  ssr: false,
});
const HoverCard = dynamic(() => import('./cards/common/HoverCard'), {
  ssr: false,
});

interface MarkdownProps {
  className?: string;
  content: string;
  appendTooltipTo?: () => HTMLElement;
}

const TOOLTIP_SPACING = 8;
const TOOLTIP_HALF_WIDTH = 140;

function isMentionLink(
  element: Element | EventTarget,
): element is HTMLAnchorElement {
  return (
    element instanceof HTMLAnchorElement && !!element.dataset.mentionId?.length
  );
}

function getTooltipOffset(element: HTMLAnchorElement): CaretOffset {
  const parentOffsetTop = element.parentElement?.offsetTop ?? 0;
  const topOffset = parentOffsetTop + element.offsetTop;
  const leftSpacing =
    TOOLTIP_HALF_WIDTH - element.getBoundingClientRect().width / 2;
  return [element.offsetLeft - leftSpacing, topOffset * -1 + TOOLTIP_SPACING];
}

export default function Markdown({
  className,
  content,
  appendTooltipTo,
}: MarkdownProps): ReactElement {
  const purify = useDomPurify();
  const { openModal } = useLazyModal();
  const { isCompanion } = useRequestProtocol();
  const containerRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState('');
  const [offset, setOffset] = useState<CaretOffset>([0, 0]);
  const [clearUser, cancelUserClearing] = useDebounceFn(
    () => setUserId(''),
    200,
  );
  const { data } = useQuery({
    queryKey: generateQueryKey(RequestKey.UserShortById, { id: userId }),
    queryFn: () => {
      return getUserShortInfo(userId);
    },
    enabled: !!userId,
  });

  // Add accessibility attributes to images after render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const images = container.querySelectorAll('img[src]');
    images.forEach((img) => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Open image');
    });
  });

  const onHoverHandler: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const element = e.target;

      if (!isMentionLink(element)) {
        if (userId) {
          clearUser();
        }
        return;
      }

      const { mentionId } = element.dataset;

      if (!mentionId) {
        return;
      }

      cancelUserClearing();
      setOffset(getTooltipOffset(element));
      setUserId(mentionId);
    },
    [cancelUserClearing, userId, clearUser],
  );

  const openImage = useCallback(
    (src: string, alt: string | undefined, originElement: Element) => {
      // The lazy-modal renderer isn't mounted in the extension companion, so
      // fall back to opening the image in a new tab there.
      if (isCompanion) {
        window.open(src, '_blank', 'noopener,noreferrer');
        return;
      }
      openModal({
        type: LazyModal.ImageView,
        props: {
          src,
          alt,
          originRect: getImageOriginRect(originElement),
        },
      });
    },
    [isCompanion, openModal],
  );

  const onImageClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      const element = getTargetElement(e.target);

      if (!element) {
        return;
      }

      const anchor = getWrappingAnchor(element, containerRef.current);

      if (isImageElement(element) && element.src) {
        e.stopPropagation();

        if (!shouldOpenAnchorImage(anchor, element.src)) {
          return;
        }

        e.preventDefault();
        openImage(
          anchor?.href || element.src,
          element.alt || undefined,
          element,
        );
        return;
      }

      if (anchor?.href && isImageUrl(anchor.href)) {
        e.preventDefault();
        e.stopPropagation();
        openImage(anchor.href, anchor.textContent?.trim() || undefined, anchor);
      }
    },
    [openImage],
  );

  const onImageKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const element = getTargetElement(e.target);

      if (
        element &&
        isImageElement(element) &&
        element.src &&
        (e.key === 'Enter' || e.key === ' ')
      ) {
        const anchor = getWrappingAnchor(element, containerRef.current);

        e.stopPropagation();

        if (!shouldOpenAnchorImage(anchor, element.src)) {
          e.preventDefault();
          anchor?.click();
          return;
        }

        e.preventDefault();
        openImage(
          anchor?.href || element.src,
          element.alt || undefined,
          element,
        );
      }
    },
    [openImage],
  );

  return (
    <HoverCard
      onMouseLeave={clearUser}
      onMouseEnter={cancelUserClearing}
      alignOffset={offset[0]}
      sideOffset={offset[1]}
      align="start"
      side="top"
      appendTo={appendTooltipTo?.()}
      trigger={
        /* Event delegation: click/keyboard handlers capture events from images inside.
           Images are made accessible via useEffect (tabindex, role, aria-label). */
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          ref={containerRef}
          className={classNames(styles.markdown, className)}
          dangerouslySetInnerHTML={{
            __html: purify?.sanitize?.(content, { ADD_ATTR: ['target'] }),
          }}
          onMouseOverCapture={onHoverHandler}
          onMouseLeave={clearUser}
          onClick={onImageClick}
          onKeyDown={onImageKeyDown}
        />
      }
    >
      {data && <UserEntityCard user={data} />}
    </HoverCard>
  );
}

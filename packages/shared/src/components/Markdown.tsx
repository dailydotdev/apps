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

function isImageElement(
  element: Element | EventTarget,
): element is HTMLImageElement {
  return element instanceof HTMLImageElement;
}

function openImageInNewTab(src: string): void {
  window.open(src, '_blank', 'noopener,noreferrer');
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
  const topOffset = element.parentElement.offsetTop + element.offsetTop;
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
      img.setAttribute('aria-label', 'Open image in new tab');
    });
  }, [content]);

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

      cancelUserClearing();
      setOffset(getTooltipOffset(element));
      setUserId(mentionId);
    },
    [cancelUserClearing, userId, clearUser],
  );

  const onImageClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const element = e.target;

    if (isImageElement(element) && element.src) {
      e.stopPropagation();
      openImageInNewTab(element.src);
    }
  }, []);

  const onImageKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const element = e.target;

    if (
      isImageElement(element) &&
      element.src &&
      (e.key === 'Enter' || e.key === ' ')
    ) {
      e.preventDefault();
      e.stopPropagation();
      openImageInNewTab(element.src);
    }
  }, []);

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

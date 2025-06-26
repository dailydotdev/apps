import type { MouseEventHandler, ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import styles from './markdown.module.css';
import type { CaretOffset } from '../lib/element';
import useDebounceFn from '../hooks/useDebounceFn';
import { useDomPurify } from '../hooks/useDomPurify';
import { getUserShortInfo } from '../graphql/users';
import { generateQueryKey, RequestKey } from '../lib/query';

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
        <div
          className={classNames(styles.markdown, className)}
          dangerouslySetInnerHTML={{
            __html: purify?.sanitize?.(content, { ADD_ATTR: ['target'] }),
          }}
          onMouseOverCapture={onHoverHandler}
          onMouseLeave={clearUser}
        />
      }
    >
      {data && <UserEntityCard user={data} />}
    </HoverCard>
  );
}

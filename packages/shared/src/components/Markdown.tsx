import React, {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import styles from './markdown.module.css';
import { ProfileTooltip } from './profile/ProfileTooltip';
import { useProfileTooltip } from '../hooks/useProfileTooltip';
import { CaretOffset } from '../lib/element';
import useDebounceFn from '../hooks/useDebounceFn';
import { useDomPurify } from '../hooks/useDomPurify';

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

export default function Markdown({
  className,
  content,
  appendTooltipTo,
}: MarkdownProps): ReactElement {
  const purify = useDomPurify();
  const [userId, setUserId] = useState('');
  const [offset, setOffset] = useState<CaretOffset>([0, 0]);
  const { fetchInfo, data } = useProfileTooltip({
    userId,
    requestUserInfo: true,
  });
  const [clearUser, cancelUserClearing] = useDebounceFn(
    () => setUserId(''),
    200,
  );

  useEffect(() => {
    if (data || !userId) {
      return;
    }
    fetchInfo();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onHover: MouseEventHandler<HTMLDivElement> = (e) => {
    const element = e.target;
    if (!isMentionLink(element)) {
      if (userId) {
        clearUser();
      }
      return;
    }

    const id = element.dataset.mentionId;
    const isSameUser = !!id && id === userId;

    if (isSameUser) {
      return;
    }

    const topOffset = element.parentElement.offsetTop + element.offsetTop;
    const leftSpacing =
      TOOLTIP_HALF_WIDTH - element.getBoundingClientRect().width / 2;
    const result: CaretOffset = [
      element.offsetLeft - leftSpacing,
      topOffset * -1 + TOOLTIP_SPACING,
    ];

    cancelUserClearing();
    setOffset(result);
    setUserId(id);
  };

  return (
    <ProfileTooltip
      userId={userId}
      tooltip={{
        placement: 'top-start',
        offset,
        visible: !!userId,
        onShow: cancelUserClearing,
        onHide: clearUser,
        appendTo: appendTooltipTo || globalThis?.document?.body || 'parent',
      }}
    >
      <div
        className={classNames(styles.markdown, className)}
        dangerouslySetInnerHTML={{
          __html: purify?.sanitize?.(content, { ADD_ATTR: ['target'] }),
        }}
        onMouseOverCapture={onHover}
      />
    </ProfileTooltip>
  );
}

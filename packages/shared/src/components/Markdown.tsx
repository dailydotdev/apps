import React, { ReactElement, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './markdown.module.css';
import { ProfileTooltip } from './profile/ProfileTooltip';
import { useProfileTooltip } from '../hooks/useProfileTooltip';
import { CaretOffset } from '../lib/element';
import useDebounce from '../hooks/useDebounce';
import { useDomPurify } from '../hooks/useDomPurify';

interface MarkdownProps {
  className?: string;
  content: string;
  appendTooltipTo?: () => HTMLElement;
}

const TOOLTIP_SPACING = 8;
const TOOLTIP_HALF_WIDTH = 140;

export default function Markdown({
  className,
  content,
  appendTooltipTo,
}: MarkdownProps): ReactElement {
  const ref = useRef<HTMLDivElement>();
  const purify = useDomPurify();
  const [userId, setUserId] = useState('');
  const [offset, setOffset] = useState<CaretOffset>([0, 0]);
  const { fetchInfo, data } = useProfileTooltip({
    userId,
    requestUserInfo: true,
  });
  const [clearUser, cancelUserClearing] = useDebounce(() => setUserId(''), 200);

  useEffect(() => {
    if (!content || !ref?.current) {
      return;
    }

    const elements = Array.from(ref.current.getElementsByTagName('a')).filter(
      (element) => !!element.getAttribute('data-mention-id'),
    );

    if (elements.length === 0) {
      return;
    }

    const onHover = (e: MouseEvent & { target: HTMLElement }) => {
      const element = e.target;
      const id = element.getAttribute('data-mention-id');

      if (!!id && id === userId) {
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

    elements.forEach((element) => {
      element.addEventListener('mouseenter', onHover);
      element.addEventListener('mouseleave', clearUser);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      elements.forEach((element) => {
        element.removeEventListener('mouseenter', onHover);
        element.removeEventListener('mouseleave', clearUser);
      });
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, userId]);

  useEffect(() => {
    if (data || !userId) {
      return;
    }
    fetchInfo();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <ProfileTooltip
      user={{ id: userId }}
      tooltip={{
        placement: 'top-start',
        offset,
        visible: !!userId,
        onShow: cancelUserClearing,
        appendTo: appendTooltipTo || globalThis?.document?.body || 'parent',
      }}
      onMouseEnter={cancelUserClearing}
      onMouseLeave={clearUser}
    >
      <div
        ref={ref}
        className={classNames(styles.markdown, className)}
        dangerouslySetInnerHTML={{
          __html: purify?.sanitize?.(content, { ADD_ATTR: ['target'] }),
        }}
      />
    </ProfileTooltip>
  );
}

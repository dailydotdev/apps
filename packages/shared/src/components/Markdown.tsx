import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { sanitize } from 'dompurify';
import styles from './markdown.module.css';
import { ProfileTooltip } from './profile/ProfileTooltip';
import { useProfileTooltip } from '../hooks/useProfileTooltip';
import { CaretOffset } from '../lib/element';

interface MarkdownProps {
  content: string;
}

const TOOLTIP_SPACING = 8;
const TOOLTIP_HALF_WIDTH = 140;

export default function Markdown({ content }: MarkdownProps): ReactElement {
  const ref = useRef<HTMLDivElement>();
  const [userId, setUserId] = useState('');
  const [offset, setOffset] = useState<CaretOffset>([0, 0]);
  const { fetchInfo, data } = useProfileTooltip({
    userId,
    requestUserInfo: true,
  });

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

      setOffset(result);
      setUserId(id);
    };

    const onMouseOut = () => setUserId('');

    elements.forEach((element) => {
      element.addEventListener('mouseenter', onHover);
      element.addEventListener('mouseleave', onMouseOut);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      elements.forEach((element) => {
        element.removeEventListener('mouseenter', onHover);
        element.removeEventListener('mouseleave', onMouseOut);
      });
    };
  }, [content, userId]);

  useEffect(() => {
    if (data || !userId) {
      return;
    }
    fetchInfo();
  }, [userId]);

  return (
    <ProfileTooltip
      user={{ id: userId }}
      tooltip={{
        placement: 'top-start',
        offset,
        visible: !!userId,
      }}
    >
      <div
        ref={ref}
        className={styles.markdown}
        dangerouslySetInnerHTML={{
          __html: sanitize(content, { ADD_ATTR: ['target'] }),
        }}
      />
    </ProfileTooltip>
  );
}

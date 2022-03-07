import React, { ReactElement, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { tippy } from '@tippyjs/react';
import { sanitize } from 'dompurify';
import styles from './markdown.module.css';
import { ProfileTooltipContent } from './profile/ProfileTooltipContent';
import { profileTooltipClasses } from './profile/ProfileTooltip';
import { useProfileTooltip } from '../hooks/useProfileTooltip';

const classes = Object.values(profileTooltipClasses).join(' ');

interface MarkdownProps {
  content: string;
}

type TippyInstance = ReturnType<typeof tippy>[0];

const getUserPermalink = (username: string) =>
  `${process.env.NEXT_PUBLIC_WEBAPP_URL}${username}`;

export default function Markdown({ content }: MarkdownProps): ReactElement {
  const [userId, setUserId] = useState('');
  const [instance, setInstance] = useState<TippyInstance>();
  const { fetchInfo, data } = useProfileTooltip({
    userId,
    requestUserInfo: true,
  });

  const onShow = (tippyInstance: TippyInstance) => {
    if (!instance) {
      setInstance(tippyInstance);
    }
    if (!userId) {
      const id = tippyInstance.reference.getAttribute('data-mention-id');
      setUserId(id);
    }
  };

  useEffect(() => {
    if (!content) {
      return;
    }

    tippy('[data-mention-id]', { onShow, interactive: true });
  }, [content]);

  useEffect(() => {
    if (data || !userId) {
      return;
    }
    fetchInfo();
  }, [userId]);

  useEffect(() => {
    if (!data || !instance) {
      return;
    }

    const div = document.createElement('div');
    div.className = classes;
    ReactDOM.render(
      <ProfileTooltipContent
        user={{
          ...data.user,
          id: userId,
          permalink: getUserPermalink(userId),
        }}
        data={data}
      />,
      div,
    );
    instance.setContent(div);
  }, [data, instance]);

  return (
    <div
      className={styles.markdown}
      dangerouslySetInnerHTML={{
        __html: sanitize(content, { ADD_ATTR: ['target'] }),
      }}
    />
  );
}

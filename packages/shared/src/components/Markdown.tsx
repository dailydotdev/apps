import React, { ReactElement, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import ReactDOM from 'react-dom';
import { tippy } from '@tippyjs/react';
import { sanitize } from 'dompurify';
import styles from './markdown.module.css';
import { ProfileTooltipContent } from './profile/ProfileTooltipContent';
import { profileTooltipClasses } from './profile/ProfileTooltip';
import { useProfileTooltip } from '../hooks/useProfileTooltip';
import { getProfile, PublicProfile } from '../lib/user';

const classes = Object.values(profileTooltipClasses).join(' ');

interface MarkdownProps {
  content: string;
}

type TippyInstance = ReturnType<typeof tippy>[0];

const getUserPermalink = (username: string) =>
  `${process.env.NEXT_PUBLIC_WEBAPP_URL}${username}`;

export default function Markdown({ content }: MarkdownProps): ReactElement {
  const [username, setUsername] = useState('');
  const [instance, setInstance] = useState<TippyInstance>();
  const queryKey = ['profile', username];
  const { data: fetchedProfile } = useQuery<PublicProfile>(
    queryKey,
    () => getProfile(username),
    { enabled: !!username },
  );
  const { fetchInfo, data } = useProfileTooltip(fetchedProfile?.id);

  const onShow = (tippyInstance: TippyInstance) => {
    if (!instance) {
      setInstance(tippyInstance);
    }
    if (!username) {
      const id = tippyInstance.reference.getAttribute('data-mention-username');
      setUsername(id);
    }
  };

  useEffect(() => {
    if (!content) {
      return;
    }

    tippy('[data-mention-username]', { onShow, interactive: true });
  }, [content]);

  useEffect(() => {
    if (!fetchedProfile || data) {
      return;
    }

    fetchInfo();
  }, [fetchedProfile]);

  useEffect(() => {
    if (!data || !instance) {
      return;
    }

    const div = document.createElement('div');
    div.className = classes;
    ReactDOM.render(
      <ProfileTooltipContent
        user={{
          ...fetchedProfile,
          username,
          permalink: getUserPermalink(username),
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

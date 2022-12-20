import { useRouter } from 'next/router';
import React, { ReactElement, useMemo } from 'react';
import { useDomPurify } from '../../hooks/useDomPurify';
import classed from '../../lib/classed';
import NotificationItemIcon from './NotificationIcon';
import { NotificationItemProps } from './NotificationItem';
import NotificationItemAvatar from './NotificationItemAvatar';

const NotificationButton = classed(
  'button',
  'flex flex-row p-3 pr-10 hover:bg-theme-hover focus:bg-theme-active rounded-16 w-full h-full overflow-hidden',
);
const NotificationAvatar = classed('span', 'flex flex-row gap-2 mb-4');
const NotificationText = classed(
  'p',
  'flex flex-col flex-1 ml-4 w-full text-left typo-callout',
);

export function InAppNotificationItem({
  icon,
  title,
  description,
  avatars,
  targetUrl,
}: NotificationItemProps): ReactElement {
  const purify = useDomPurify();
  const router = useRouter();
  const { title: memoizedTitle, description: memoizedDescription } =
    useMemo(() => {
      if (!purify?.sanitize) {
        return { title: '', description: '' };
      }

      return {
        title: purify.sanitize(title),
        description: purify.sanitize(description),
      };
    }, [purify, title, description]);

  if (!purify) {
    return null;
  }

  const avatarComponents =
    avatars?.map?.((avatar) => (
      <NotificationItemAvatar key={avatar.referenceId} {...avatar} />
    )) ?? [];
  const hasAvatar = avatarComponents.some((component) => !!component);

  const onClick = () => {
    router.push(targetUrl);
  };

  return (
    <NotificationButton onClick={onClick}>
      <NotificationItemIcon icon={icon} />
      {hasAvatar && <NotificationAvatar>{avatarComponents}</NotificationAvatar>}
      <NotificationText>
        <span
          className="font-bold break-words"
          dangerouslySetInnerHTML={{
            __html: memoizedTitle,
          }}
        />
        {description && (
          <p
            className="mt-2 w-4/5 break-words text-theme-label-quaternary"
            dangerouslySetInnerHTML={{
              __html: memoizedDescription,
            }}
          />
        )}
      </NotificationText>
    </NotificationButton>
  );
}

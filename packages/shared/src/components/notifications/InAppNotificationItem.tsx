import type { ReactElement } from 'react';
import React from 'react';
import { useObjectPurify } from '../../hooks/useDomPurify';
import { NotificationItemLead } from './NotificationItemLead';
import { getNotificationLeadAvatar } from './leadAvatar';
import type { NewNotification } from '../../graphql/notifications';

interface InAppNotificationItemProps extends NewNotification {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

// Real-time popup, laid out like a feed row (NotificationItem): the avatar with
// its colored category badge leads, then the headline with the actor's name
// bold and the rest regular for a scannable hierarchy.
export function InAppNotificationItem({
  icon,
  type,
  title,
  avatars,
  targetUrl,
  onClick,
}: InAppNotificationItemProps): ReactElement | null {
  const { title: memoizedTitle, isReady } = useObjectPurify({ title });

  if (!isReady) {
    return null;
  }

  const avatar = getNotificationLeadAvatar(avatars);

  return (
    <div className="relative flex h-full w-full flex-row items-start gap-3 rounded-16 p-3 pr-10">
      <a
        className="absolute inset-0 z-0 h-full w-full"
        href={targetUrl}
        onClick={onClick}
        aria-label="Open notification"
      />
      <div className="mt-0.5 flex w-10 shrink-0 items-center justify-start self-start">
        <NotificationItemLead type={type} icon={icon} avatar={avatar} />
      </div>
      <p
        className="mt-0.5 line-clamp-3 min-w-0 flex-1 break-words text-left font-normal text-text-primary typo-callout [&_b]:font-bold [&_p]:m-0 [&_strong]:font-bold"
        dangerouslySetInnerHTML={{
          __html: memoizedTitle,
        }}
      />
    </div>
  );
}

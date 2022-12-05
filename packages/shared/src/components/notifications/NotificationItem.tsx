import classNames from 'classnames';
import createDOMPurify from 'dompurify';
import React, { ReactElement, useState } from 'react';
import { Notification } from '../../graphql/notifications';
import { getFadedBackground } from '../../lib/styling';
import NotificationItemAttachment from './NotificationItemAttachment';
import NotificationItemAvatar from './NotificationItemAvatar';

interface NotificationItemProps
  extends Pick<
    Notification,
    'type' | 'icon' | 'title' | 'description' | 'avatars' | 'attachments'
  > {
  isUnread?: boolean;
}

function NotificationItem({
  icon,
  type,
  title,
  isUnread,
  description,
  avatars,
  attachments,
}: NotificationItemProps): ReactElement {
  const [purify] = useState<DOMPurify.DOMPurifyI>(
    createDOMPurify(globalThis.window),
  );

  return (
    <div
      className={classNames(
        'flex flex-row py-4 pl-6 pr-4',
        isUnread && getFadedBackground('before:bg-theme-active'),
      )}
    >
      <span
        className={classNames(
          'p-1 rounded-8 typo-callout h-fit overflow-hidden',
          isUnread && getFadedBackground('before:bg-theme-divider-tertiary'),
        )}
      >
        <img src={icon} alt={`${type}'s icon`} />
      </span>
      <div className="flex flex-col flex-1 ml-4 w-full typo-callout">
        {avatars && (
          <span className="flex flex-row gap-2 mb-4">
            {avatars.map((avatar) => (
              <NotificationItemAvatar key={avatar.referenceId} {...avatar} />
            ))}
          </span>
        )}
        <span
          className="font-bold break-words"
          dangerouslySetInnerHTML={{
            __html: purify?.sanitize?.(title),
          }}
        />
        {description && (
          <p
            className="mt-2 w-4/5 break-words text-theme-label-quaternary"
            dangerouslySetInnerHTML={{
              __html: purify?.sanitize?.(description),
            }}
          />
        )}
        {attachments?.map(({ image, title: attachment }) => (
          <NotificationItemAttachment
            key={attachment}
            image={image}
            title={attachment}
          />
        ))}
      </div>
    </div>
  );
}

export default NotificationItem;

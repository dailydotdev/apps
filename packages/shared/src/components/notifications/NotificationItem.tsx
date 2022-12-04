import classNames from 'classnames';
import createDOMPurify from 'dompurify';
import React, { ReactElement, ReactNode, useEffect, useRef } from 'react';
import { getFadedBackground } from '../../lib/styling';
import NotificationItemAttachment, {
  NotificationItemAttachmentProps,
} from './NotificationItemAttachment';
import NotificationItemAvatar, {
  NotificationItemAvatarProps,
} from './NotificationItemAvatar';

interface NotificationItemProps {
  icon: ReactNode;
  title: string;
  isUnread?: boolean;
  description?: string;
  avatars?: NotificationItemAvatarProps[];
  attachments?: NotificationItemAttachmentProps[];
}

function NotificationItem({
  icon,
  title,
  isUnread,
  description,
  avatars,
  attachments,
}: NotificationItemProps): ReactElement {
  const DOMPurify = useRef<DOMPurify.DOMPurifyI>();

  useEffect(() => {
    DOMPurify.current = createDOMPurify(window);
  }, []);

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
        {icon}
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
            __html: DOMPurify?.current?.sanitize(title),
          }}
        />
        {description && (
          <p
            className="mt-2 w-4/5 break-words text-theme-label-quaternary"
            dangerouslySetInnerHTML={{
              __html: DOMPurify?.current?.sanitize(description),
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

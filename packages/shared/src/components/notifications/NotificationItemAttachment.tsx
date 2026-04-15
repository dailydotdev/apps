import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { NotificationAttachment } from '../../graphql/notifications';
import { NotificationAttachmentType } from '../../graphql/notifications';
import { IconSize } from '../Icon';
import { CardCover } from '../cards/common/CardCover';
import { NotificationType } from './utils';

interface NotificationItemAttachmentProps extends NotificationAttachment {
  notificationType?: NotificationType;
}

const truncatedNotificationTypes = new Set([
  NotificationType.SourcePostAdded,
  NotificationType.UserPostAdded,
  NotificationType.SquadPostAdded,
]);

function NotificationItemAttachment({
  image,
  title,
  type,
  notificationType,
}: NotificationItemAttachmentProps): ReactElement {
  return (
    <div className="mt-2 flex flex-row items-center rounded-16 border border-border-subtlest-tertiary p-4">
      <div>
        <CardCover
          data-testid="postImage"
          isVideoType={type === NotificationAttachmentType.Video}
          imageProps={{
            loading: 'lazy',
            alt: `Cover preview of: ${title}`,
            src: image,
            className: '!h-16 w-24 !rounded-16',
          }}
          videoProps={{ size: IconSize.XLarge }}
        />
      </div>
      <span
        className={classNames(
          'ml-4 flex-1 break-words typo-callout',
          notificationType &&
            truncatedNotificationTypes.has(notificationType) &&
            'multi-truncate line-clamp-3',
        )}
      >
        {title}
      </span>
    </div>
  );
}

export default NotificationItemAttachment;

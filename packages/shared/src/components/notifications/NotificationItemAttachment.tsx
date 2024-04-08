import React, { ReactElement } from 'react';
import {
  NotificationAttachment,
  NotificationAttachmentType,
} from '../../graphql/notifications';
import { IconSize } from '../Icon';
import { CardCover } from '../cards/common/CardCover';

function NotificationItemAttachment({
  image,
  title,
  type,
}: NotificationAttachment): ReactElement {
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
      <span className="ml-4 flex-1 break-words typo-callout">{title}</span>
    </div>
  );
}

export default NotificationItemAttachment;

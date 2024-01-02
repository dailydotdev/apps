import React, { ReactElement } from 'react';
import {
  NotificationAttachment,
  NotificationAttachmentType,
} from '../../graphql/notifications';
import { cloudinary } from '../../lib/image';
import { Image } from '../image/Image';
import VideoImage from '../image/VideoImage';
import { IconSize } from '../Icon';

function NotificationItemAttachment({
  image,
  title,
  type,
}: NotificationAttachment): ReactElement {
  const ImageComponent =
    type === NotificationAttachmentType.Video ? VideoImage : Image;

  return (
    <div className="mt-2 flex flex-row items-center rounded-16 border border-theme-divider-tertiary p-4">
      <div>
        <ImageComponent
          src={image}
          alt={`Cover preview of: ${title}`}
          className="h-16 w-24 rounded-16 object-cover"
          loading="lazy"
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          {...(type === NotificationAttachmentType.Video && {
            size: IconSize.XLarge,
          })}
        />
      </div>
      <span className="ml-4 flex-1 break-words typo-callout">{title}</span>
    </div>
  );
}

export default NotificationItemAttachment;
